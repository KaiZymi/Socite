import { UsersType} from "../types/typeReducers";

import { BaseThunkType, InferActionsTypes} from "./store";
import {usersAPI} from "../api/users-api";
import {ResultCodesEnum} from "../api/api";






let initialState = {
    users: [ ] as Array<UsersType>,
    pageSize: 2,
    totalUsersCount: 0,
    currentPage: 1,
    isFetching: true,
    followingInProgress: [] as Array<number>,


};



const usersReducer = (state = initialState, action: ActionsTypes): initialStateType => {
    switch(action.type) {
        case 'SN/USERS/FOLLOW':
            return {
                ...state,
                users: state.users.map( u =>  {
                    if (u.id === action.userId) {
                        return {...u, followed: true}
                    }
                    return u;
                })
            }
        case 'SN/USERS/UNFOLLOW':
            return {
                ...state,
                users: state.users.map( u =>  {
                    if (u.id === action.userId) {
                        return {...u, followed: false}
                    }
                    return u;
                })
            }
        case 'SN/USERS/SET_USERS': {
            return { ...state, users: action.users}
        }
        case 'SN/USERS/SET_CURRENT_PAGE': {
            return { ...state, currentPage: action.currentPage }
        }
        case 'SN/USERS/SET_TOTAL_COUNT': {
            return { ...state, totalUsersCount: action.totalUsersCount }
        }
        case "SN/USERS/TOGGLE_IS_FETCHING": {
            return { ...state, isFetching: action.isFetching }
        }
        case 'SN/USERS/TOGGLE_IS_FOLLOWING_PROGRESS': {
            return { ...state,
                followingInProgress: action.isFetching
                    ? [...state.followingInProgress, action.userId]
                    : state.followingInProgress.filter(id => id !== action.userId)
            }
        }
        default:
            return state;
    }
}




export const actions = {
    followSuccess: (userId:number)  => ({ type: 'SN/USERS/FOLLOW', userId } as const),
    unfollowSuccess: (userId: number) => ({ type: 'SN/USERS/UNFOLLOW', userId } as const),
    setUsers: (users: Array<UsersType>)  => ({ type: 'SN/USERS/SET_USERS', users } as const),
    setCurrentPage: (currentPage: number) => ({ type: 'SN/USERS/SET_CURRENT_PAGE', currentPage } as const),
    setTotalUserCount: (totalUsersCount: number) => ({ type: 'SN/USERS/SET_TOTAL_COUNT', totalUsersCount } as const),
    toggleIsFetching: (isFetching: boolean)=> ({ type: 'SN/USERS/TOGGLE_IS_FETCHING', isFetching } as const),
    toggleFollowingProgress: (isFetching: boolean, userId: number)=> ({ type: 'SN/USERS/TOGGLE_IS_FOLLOWING_PROGRESS', isFetching, userId } as const)
}






export const requestUsers = (currentPage: number, pageSize: number):ThunkType =>{
    return async (dispatch) => {
        dispatch(actions.toggleIsFetching(true))

        let data = await usersAPI.getUsers(currentPage, pageSize)
        dispatch(actions.setCurrentPage(currentPage))
        dispatch(actions.toggleIsFetching(false))
        dispatch(actions.setUsers(data.items))
        dispatch(actions.setTotalUserCount(data.totalCount))

    }
}

export const follow = (userId: number):ThunkType =>{
    return async (dispatch) => {
        dispatch(actions.toggleFollowingProgress(true, userId))
        let response = await usersAPI.follow(userId)

        if (response.resultCode === 0) {
            dispatch(actions.followSuccess(userId))
        }
        dispatch(actions.toggleFollowingProgress(false, userId))

    }
}

export const unfollow = (userId: number): ThunkType =>{
    return async(dispatch) => {
        dispatch(actions.toggleFollowingProgress(true, userId))

        let response = await usersAPI.unfollow(userId)

        if (response.data.resultCode === 1) {
            dispatch(actions.unfollowSuccess(userId))
        }
        dispatch(actions.toggleFollowingProgress(false, userId))

    }
}



export default usersReducer


type initialStateType = typeof initialState
type ActionsTypes = InferActionsTypes<typeof actions>
type ThunkType = BaseThunkType<ActionsTypes>