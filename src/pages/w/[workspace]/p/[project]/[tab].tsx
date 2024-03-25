import Releases from "@/components/tabs/ReleasesTab";
import Builds from "@/components/tabs/builds";
import Issues from "@/components/tabs/issues";
import axios from "axios";
import {useRouter} from "next/router";
import Milestones from "@/components/tabs/milestones/milestones";

export default function ProjectTab() {
    const router = useRouter();
    const {tab} = router.query;

    return tab === 'issues' ? <Issues/>
        : tab === 'builds' ? <Builds/>
            : tab === 'releases' ? <Releases/>
                : tab === 'milestones' ? <Milestones/>
                    : <>Unknown tab: {tab}</>
}