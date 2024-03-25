import { api, auth } from '@/pages/_app';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function Logout() {

    const router = useRouter();

    const handleLogout = () => {
        signOut(auth).then(r => {
            api.defaults.headers['Authorization'] = null;
            router.push('/');
        });
    }

    return <button onClick={handleLogout}>
        Log out!
    </button>

}