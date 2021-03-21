import '../normalize.css';
import '../styles.scss';
import '../grid.scss';

import { ClassComponent, vdom } from "simple-tsx-vdom";
import { PageState, setSelectedPageId, State, store, WindowHistory } from "../store";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { Posts } from "./posts";
import Ripples from '../ripples/ripples';

interface Props
{
    readonly state: State;
}

export class App extends ClassComponent<Props>
{
    private ripple: Ripples | null = null;
    public hasChanged(newProps: Props): boolean
    {
        return true;
    }

    public onMount()
    {
        if (typeof window === 'undefined')
        {
            return;
        }

        const canvas = document.getElementById('canvas') as HTMLCanvasElement;

        if (canvas)
        {
            canvas.width = window.outerWidth;
            canvas.height = window.outerHeight;
            console.log(window.outerHeight);
            this.ripple = new Ripples(canvas, 512);
            this.ripple.loadBackground('/assets/bg2.jpg');
        }
    }

    public render()
    {
        const { pages, posts, selectedPageId, darkTheme } = this.props.state;

        return <main class='container'>
            <Navbar selectedPageId={selectedPageId} pages={pages} onPageChange={onPageChange} darkTheme={darkTheme} />
            <Posts key={selectedPageId} category={pages.find(c => c.id === selectedPageId)} posts={posts[selectedPageId]} />
            <Footer />
            <canvas id="canvas" />
        </main>
    }
}

function onPageChange(page: PageState)
{
    const pushedState: WindowHistory = {
        pageId: page.id
    }

    window.history.pushState(pushedState, page.title, `/${page.id}`);
    store.execute(setSelectedPageId(page.id));
}