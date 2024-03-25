import { KeyboardEvent, useContext, useState } from 'react'
import style from './ProjectDetailsPanel.module.scss'
import { ProjectContext } from '@/layouts/ProjectLayout'
import TextField from './TextField';
import { useAuth } from '@/hooks/useAuth';
import { url } from 'inspector';

export function ProjectDetailsPanel() {
    const project = useContext(ProjectContext);
    return <div className={style.detailsPanel}>
        <div className={style.detailsTabs}>
            <button className={style.selected}>DISCUSSION</button>
            <button>ASSETS</button>
        </div>
        <div className={style.tabContent}>
            <Discussion />
        </div>
    </div>
}

function Discussion() {

    const [message, setMessage] = useState("");
    const [discussion, setDiscussion] = useState<DiscussionMessage[]>([
        { id: "1", author: 'nodii', content: "Alane", timestamp: 0 },
        { id: "2", author: 'Alan', content: "a", timestamp: 0 },
        { id: "3", author: 'nodii', content: "sajt kurcu ne valja", timestamp: 0 },
    ]);

    function handleEnter(ev: KeyboardEvent) {
        if (ev.shiftKey) {
            return;
        }

        ev.preventDefault();

        setDiscussion(discussion => {
            discussion.push({
                id: Date.now().toString(),
                author: "Alan",
                content: message,
                timestamp: Date.now(),
            })

            return discussion;
        })

        setMessage("");
    }

    return <div className={style.discussionTab}>
        <div className={style.discussion}>
            {messagesToBubbles(discussion).map(bubble => {
                return <DiscussionBubble key={bubble.id} author={bubble.author} messages={bubble.messages} />
            })}
        </div>
        <div className={style.inputBox}>
            <hr />
            <TextField placeholder="Type your message" valueProvider={message} valueSetter={setMessage} onEnterPress={handleEnter} />
            <button>Send</button>
        </div>

    </div>

}

interface DiscussionMessage {
    id: string,
    author?: string,
    content: string | { emoji: string },
    timestamp: number
}

interface DiscussionBubbleType {
    id: string,
    author: string,
    messages: DiscussionMessage[]
}

function DiscussionBubble({ author, messages }: { author: string, messages: { author?: string, content: string | { emoji: string }, timestamp: number }[] }) {
    const auth = useAuth();
    return <article>
        <div className={`${style.bubble} ${author === auth.name ? style.me : ''}`}>
            {(author !== auth.name || true) && <p className={style.avatar}></p>}
            <div>
                <p className={style.author}>{author}</p>
                <div>
                    {messages.map(message => <p key={message.content.toString()}>{message.content as string}</p>)}
                </div>
            </div>
            {/* {author === auth.name && <p className={style.avatar} style={{backgroundImage: `url(${auth.avatar})`}}></p>} */}
        </div>
    </article>;
}

function messagesToBubbles(messages: DiscussionMessage[]) {
    if (messages.length === 0) return [];

    const bubbles: { [id: string]: DiscussionBubbleType } = {};
    let lastMessage = messages[0];
    let lastBubble: DiscussionBubbleType = { author: lastMessage.author as string, id: lastMessage.id, messages: [lastMessage] };

    for (let i = 1; i < messages.length; i++) {
        if (messages[i].author === lastMessage.author) {
            lastBubble.messages.push(messages[i]);
            continue;
        }

        bubbles[lastBubble.id] = lastBubble;
        const message = messages[i];
        lastMessage = message;

        const bubble: DiscussionBubbleType = {
            author: message.author as string,
            id: message.id,
            messages: [message]
        };

        lastBubble = bubble;
    }

    bubbles[lastBubble.id] = lastBubble;
    return Object.values(bubbles);
}