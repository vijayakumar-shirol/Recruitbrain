export interface User {
    id?: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    roles?: string[];
    profilePictureUrl?: string;
    password?: string;
}
