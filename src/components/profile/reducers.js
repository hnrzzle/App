
export const PROFILE_LOAD = 'PROFILE_LOAD';
export const PROFILES_LOAD = 'PROFILES_LOAD';

export function profile( state = {}, { type, payload }) {
    switch(type) {
        case PROFILE_LOAD: {
            return payload;
        }
        default:
        return state;
    }
}

export function profiles(state = [], { type, payload }) {
    switch (type) {
        case PROFILES_LOAD: {
            return payload;
        }
        default:
            return state;
    }
}