import { UserContext, auth, firebaseApp } from "@/pages/_app";
import { EmailAuthProvider, User, updatePassword as firebaseUpdatePassword, getAuth, reauthenticateWithCredential } from "firebase/auth";
import { useRouter } from "next/router";
import { useContext } from "react";

export function useAuth(): { name: string, email: string, avatar: string, updatePassword: (password: string) => void, logout: () => void } {

    const { name, avatar } = useContext(UserContext);
    const router = useRouter();

    function logout() {
        auth.signOut().then(() => {
            router.reload();
        });
    }

    function updatePassword(password: string) {
        const user = auth.currentUser as User;
        const credentials = EmailAuthProvider.credential(user.email as string, prompt("Current Password") as string);
        reauthenticateWithCredential(user, credentials).then(credential => {
            firebaseUpdatePassword(user, password)
            .then(() => {
                alert('Success!');
            })
            .catch(e => {
                alert('Fail! ' + e);
            });
        });
    }

    return {
        name,
        avatar,
        email: auth.currentUser?.email || '',
        updatePassword,
        logout
    }

}