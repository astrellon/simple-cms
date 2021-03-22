import { ClassComponent, vdom } from "simple-tsx-vdom";
import { PostPictureState } from "../store";
import './post-picture.scss';
import { hoverOutElement, hoverOverElement } from "./signals";

interface Props
{
    readonly picture: PostPictureState;
}

export class PostPicture extends ClassComponent<Props>
{
    public render()
    {
        const { position, url, caption } = this.props.picture;

        return <div class={`post-picture is--${position}`} onmouseenter={this.onMouseEnter} onmouseleave={this.onMouseLeave}>
            <img src={url} />
            {caption && <div class='post-picture__caption'>{caption}</div>}
        </div>
    }

    private onMouseEnter = (e: MouseEvent) =>
    {
        const el = e.target as HTMLElement;
        hoverOverElement.trigger(el);
    }

    private onMouseLeave = (e: MouseEvent) =>
    {
        const el = e.target as HTMLElement;
        hoverOutElement.trigger(el);
    }
}