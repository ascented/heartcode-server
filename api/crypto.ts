import sha256 from 'sha256';


export const hashFrom = (value: any) => {
    return sha256(value.toString());
}

export const generateToken = () => {
    return hashFrom(new Date().getTime() + Math.random());
}