const userIdKey         = 'userId'
const userEmailKey      = 'userEmail'
const userAccessTokenKey = 'userAccessToken'


export function localStoreUser(id, email) {
    sessionStorage.setItem(userIdKey,    id)
    sessionStorage.setItem(userEmailKey, email)
}

export function localStoreAccessToken(access_token) {
    sessionStorage.setItem(userAccessTokenKey, access_token)
}

export function localRetrieveUser() {
    return {
        id :    sessionStorage.getItem(userIdKey)    || '',
        email : sessionStorage.getItem(userEmailKey) || ''
    }
}

export function localRetrieveAccessToken() {
    return sessionStorage.getItem(userAccessTokenKey) || '';
}

export function localRemoveUser() {
    sessionStorage.removeItem(userIdKey)
    sessionStorage.removeItem(userEmailKey)
}

export function localRemoveAccessToken() {
    sessionStorage.removeItem(userAccessTokenKey)
}
