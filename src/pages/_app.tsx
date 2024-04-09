import type {AppProps} from 'next/app'
import nextApp from 'next/app';
import {useRouter} from 'next/router';
import {initializeApp} from "firebase/app";
import {EmailAuthProvider, getAuth} from 'firebase/auth';

import '../styles/global.scss'
import '../styles/variables.scss'
import 'react-toastify/dist/ReactToastify.css';

import React, {Context, useEffect, useState} from 'react';
import axios from 'axios';
import Login from './login';
import {User} from '@/types/User';
import {ThemeProvider} from 'next-themes';
import {ObjectFlags} from 'typescript';
import ProjectLayout from '@/layouts/ProjectLayout';
import ReactModal from 'react-modal';
import {AppContext} from '@/contexts/ProjectsContext';
import {Project} from '@/types/Project';
import {Label} from '@/types/Label';
import {SearchContextProvider} from '@/contexts/SearchContext';
import Sidebar from '@/components/Sidebar';
import {Group} from '@/types/Group';
import {ToastContainer} from 'react-toastify';
import Account from '@/components/account/Account';
import {DndContext, DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {SavingProvider} from '@/contexts/SavingContext';
import {LoadingScreen} from '@/components/LoadingScreen';
import {FullscreenImageContextProvider} from '@/components/modals/FullscreenImageModal';
import {InviteCollaboratorModal} from '@/components/modals/InviteCollaboratorModal';
import {useFetch} from "@/hooks/useFetch";
import {Notification} from "@/types/Notification";
import {Workspace} from "@/types/Workspace";
import Navbar from "@/components/navbar/Navbar";
import {useLocal} from "@/hooks/useLocal";

const firebaseConfig = {
    apiKey: "AIzaSyByURAtf7qlpWAqItqcvdg9ddla0wjhL9I",
    authDomain: "myqualia-45f29.firebaseapp.com",
    projectId: "myqualia-45f29",
    storageBucket: "myqualia-45f29.appspot.com",
    messagingSenderId: "551038491560",
    appId: "1:551038491560:web:b1035bcbd96c583b4cdb9d",
    measurementId: "G-S69W1QP1H7"
};

export let UserContext = React.createContext({} as User);

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

export const api = axios.create({
    baseURL: '/api'
});

api.interceptors.request.use(async req => {
    if (auth.currentUser !== null) {
        const token = await auth.currentUser?.getIdToken();
        req.headers.set('Authorization', `Bearer ${token}`);
    }

    return req;
})

let isAuthStateObserverRegistered = false;

export default function App({pageProps, Component}: AppProps) {
    const [user, setUser] = useState({} as User);
    const [isLoading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Logging in');
    const [isFirebaseReady, setFirebaseReady] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [workspace, setWorkspace] = useState<Workspace>({name: "Loading", weak_id: ""});
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);
    const [layout, setLayout] = useState<string>();
    const [isPageLoaded, setPageLoaded] = useState(true);
    const [attempt, setAttempt] = useState(1);
    const [isInvitingCollaborator, setIsInvitingCollaborator] = useState(false);
    const [latestWorkspace, setLatestWorkspace] = useLocal('latestWorkspace', null);

    const [workspacesLoaded, setWorkspacesLoaded] = useState(false);
    const [projectsLoaded, setProjectsLoaded] = useState(false);

    const router = useRouter();

    function navigate(url: string) {
        if (!isPageLoaded)
            return;

        router.push(url);
        setPageLoaded(false);
    }

    // const auth = useAuth0();

    // useEffect(() => setLoading(auth.isLoading), [auth.isLoading]);

    // if (auth.isLoading) {
    // return <div>Loggin in...</div>;
    // }

    // if (isProjectsContextLoading) {

    const workspaceId = router.query.workspace as string;

    useEffect(() => {
        if (!user.isLoggedIn) return;
        setLoading(true);
        setLoadingProgress(15);
        setLoadingText("Loading workspaces");

        function loadWorkspace(workspaces: Workspace[]) {
            // Check if user has access to the workspace
            const workspace = workspaces.find(w => w.weak_id === workspaceId);
            if (workspace === undefined) {
                // TODO: Redirect users to a "no access or workspace does not exist" page
                router.push('/');
                return;
            }

            setWorkspace(workspace || {weak_id: "", name: "Loading"});
            setProjectsLoaded(false);

            setLoadingProgress(30);
            if (workspaces.length === 0) {
                setLoadingText('Ready!');
                setLoadingProgress(100);
                setProjectsLoaded(true);

                return;
            }

            setLoadingText(attempt === 1 ? 'Loading projects' : `Loading projects (${attempt})`);
            api.get<Group[]>(`/v1/workspaces/${workspaceId}/projects?group=true`).then(result => {
                setGroups(result.data);
                setProjects(result.data.map(group => group.projects).flat());
                setProjectsLoaded(true);

                setLoadingText('Loading labels');
                setLoadingProgress(70);
                axios.get('/api/v1/labels').then(result => setLabels(result.data)).catch(() => setLabels([])).finally(() => {
                    setLoadingText('Ready!');
                    setLoadingProgress(100);
                });

                setLatestWorkspace(workspaceId);
            }).catch(err => {
                setTimeout(() => setAttempt(att => att + 1), 5000);
            });
        }

        if (workspacesLoaded) {
            loadWorkspace(workspaces);
        } else {
            api.get<Workspace[]>(`/v1/workspaces`).then(result => {
                setWorkspaces(result.data);
                setWorkspacesLoaded(true);

                if (router.asPath === '/') {
                    return;
                }

                loadWorkspace(result.data);
            });
        }
    }, [user.isLoggedIn, attempt, workspaceId]);

    useEffect(() => {

        ReactModal.setAppElement('#__next');

        if (router.route.startsWith('/w/[workspace]/p/')) {
            setLayout('project');
        } else if (router.route === '/login') {
            setLayout('login');
        } else if (router.route === '/board') {
            setLayout('board');
        } else if (router.route === '/activity') {
            setLayout('activity');
        } else if (router.route === '/') {
            setLayout('home');
        } else {
            setLayout(undefined);
        }

        if (!isAuthStateObserverRegistered) {
            auth.onAuthStateChanged(() => setFirebaseReady(true));
        }

        if (!isFirebaseReady)
            return;

        if (attempt > 1 && !user.isLoggedIn) {
            setLoadingText(`Logging in (${attempt})`);
        }

        console.log(auth);
        console.log(`Route: ${router.route}`);
        if (router.route === '/login') {
            if (isLoading) {
                setLoading(false);
            }
        } else if (router.route !== '/login' && Object.keys(user).length === 0) {
            setLoading(true);
            setLoadingProgress(7);
            api.get('/v1/users/me').then(response => {
                setLoadingProgress(15)
                if (response.status !== 200)
                    router.push(`/login?return=${router.asPath}`);
                else {
                    setUser({
                        ...response.data,
                        isLoggedIn: true
                    });
                    setAttempt(1);
                }
            }).catch(err => {
                if (err.response.status === 500) {
                    setTimeout(() => setAttempt(att => att + 1), 5000);
                } else {
                    router.push(`/login?return_to=${router.asPath}`);
                }
            });
        }

    }, [router.asPath, isFirebaseReady, attempt]);

    useEffect(() => {
        if (router.route.startsWith('/w/[workspace]')) {
            setWorkspace(workspaces.find(w => w.weak_id === workspaceId) || {weak_id: "", name: "Loading"});
            console.log(`workspace:`, workspaces.find(w => w.weak_id === workspaceId) || {
                weak_id: "",
                name: "Loading"
            });
        }
    }, [router.asPath, workspaces]);

    return (
        <UserContext.Provider value={user}>
            <ThemeProvider>
                <SavingProvider>
                    <AppContext.Provider value={{labels: labels, groups, isPageLoaded, workspace, workspaces}}>
                        <DndProvider backend={HTML5Backend}>
                            <SearchContextProvider navigate={navigate}>
                                <FullscreenImageContextProvider>
                                    {layout === 'home' && user.isLoggedIn && workspacesLoaded && <>
                                        <Navbar />
                                        <Component {...pageProps} />
                                    </>}

                                    {layout !== 'login' && layout !== 'home' && user.isLoggedIn && workspacesLoaded && projectsLoaded &&
                                        <div className='page-container'>
                                            <Sidebar key="sidebar" {...pageProps} navigate={navigate}
                                                     setProjects={setGroups}
                                                     inviteCollaborator={() => setIsInvitingCollaborator(true)}/>
                                            <div className={`page ${layout === 'board' && 'expandable'}`}>
                                                {layout === 'project' && <>
                                                    <ProjectLayout {...pageProps} setPageLoaded={setPageLoaded}>
                                                        <Component {...pageProps} />
                                                    </ProjectLayout>
                                                </>}
                                                {layout !== 'project' && <Component {...pageProps} />}
                                                {/* {layout !== 'login' && <Account />} */}
                                            </div>

                                            {isInvitingCollaborator && <InviteCollaboratorModal
                                                close={() => setIsInvitingCollaborator(false)}/>}
                                        </div>}

                                    {layout === 'login' && <Login {...pageProps} />}

                                    <ToastContainer position='bottom-right' theme='light' autoClose={2000}
                                                    toastStyle={{minHeight: '40px'}}/>
                                    {isLoading && <LoadingScreen progress={loadingProgress} text={loadingText}/>}
                                    {/* <LoadingScreen progress={loadingProgress} text={loadingText}/> */}
                                </FullscreenImageContextProvider>
                            </SearchContextProvider>
                        </DndProvider>
                    </AppContext.Provider>
                </SavingProvider>
            </ThemeProvider>
        </UserContext.Provider>

    );
}