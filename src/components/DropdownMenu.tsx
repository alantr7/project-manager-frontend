import { useFocus } from '@/hooks/useFocus';
import style from './DropdownMenu.module.scss';
import {JSXElementConstructor, ReactElement, ReactNode, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import iconArrow from '../../public/dropdown.png';

interface MenuProps {
    children?: ReactElement | ReactElement[],
    left?: number,
    top?: number,
    className?: string,
    onClose?(): void
}

interface GroupProps {
    children?: ReactElement | ReactElement[],
    title: string,
    onClick?(): void
}

interface ItemProps {
    children: ReactNode,
    icon?: string,
    onClick?(): void
}

export function DropdownMenu(props: MenuProps) {
    const [hovered, setHovered] = useState(-1);
    const [hoveredPos, setHoveredPos] = useState<[number, number]>([0, 0]);
    const ref = useRef<HTMLDivElement>(null);
    const [children, setChildren] = useState(props.children);

    const menuProps = props;
    useFocus(ref, {
        autoFocus: true,
        blur: props.onClose,
        hideOutline: true
    });

    useEffect(() => {
        setChildren(props.children);
    }, [ props.children ]);

    return <div className={`${style.dropdownMenu} ${props.className && props.className}`} ref={ref} style={{left: props.left + 'px', top: props.top + 'px'}}>
        {(Array.isArray(children) ? children : [children]).map((child, index) => {
            if (child === undefined) {
                return;
            }

            if (child.type.toString() === DropdownItem.toString()) {
                return <div className={style.item} onMouseOver={() => setHovered(index)} onClick={child.props.onClick}>
                    {child.props.icon && <img src={child.props.icon} className={style.icon} />}
                    {child.props.children}
                </div>
            }

            if (child.type.toString() === DropdownGroup.toString()) {
                const props = child.props as GroupProps;
                return <div className={`${style.item} ${style.group}`} onMouseOver={e => (setHovered(index), setHoveredPos([0, (e.currentTarget as HTMLElement).getBoundingClientRect().top]))}>
                    {props.title}
                    {hovered === index && <div>
                        {createPortal(<DropdownMenu className={menuProps.className} left={(menuProps.left || 0) + 240} top={hoveredPos[1] - 8}>{props.children}</DropdownMenu>, document.body)}
                    </div>}

                    <img className={style.arrow} src={iconArrow.src} />
                </div>
            }
            return child;
        })}
    </div>
}

export function DropdownItem(props: ItemProps) {
    return <></>
}

export function DropdownGroup(props: GroupProps) {
    return <></>
}

function DropdownMenuWrapper(props: MenuProps) {
    return <div>
        {props.children}
    </div>
}