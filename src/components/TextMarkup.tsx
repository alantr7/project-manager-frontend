import style from '../components/Content.module.scss';

interface TextMarkupProps {
    children: string
}

interface Element {
    content: string,
    isBold: boolean,
    isItalic: boolean,
    isUnderlined: boolean,
    isStrikethrough: boolean
}

export function TextMarkup(props: TextMarkupProps) {
    const elements = generateElements(props.children);
    return <>{convertElementsToSpans(elements)}</>
}

function generateElements(text: string): Element[] {
    const elements: Element[] = [];

    let startPos = 0;
    let isBold = false;
    let isItalic = false;

    let asteriskCount = 0;

    for (let i = 0; i < text.length; i++) {
        switch (text[i]) {
            case '*': {
                asteriskCount++;
                break;
            }
            default: {
                if (asteriskCount === 2) {
                    isBold = true;
                }
                else if (asteriskCount === 1) {
                    isItalic = true;
                }
                asteriskCount = 0;
                break;
            }
        }
    }

    return [ { content: text, isBold: false, isItalic: false, isStrikethrough: false, isUnderlined: false } ];
}

function convertElementsToSpans(elements: Element[]) {
    return <>
        {elements.map(element => {
            return <span key={Math.random()}>{element.content}</span>
        })}
    </>
}