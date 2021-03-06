import parse from "node-html-parser";
import DataStore from "simple-data-store";
import { render, vdom, VDom } from "simple-tsx-vdom";
import { SSRDomDocument } from "simple-tsx-vdom-ssr";
import { App } from "./client/components/app";
import { State } from "./client/store";
import equal from 'fast-deep-equal';

interface PreviousRender
{
    readonly state: Partial<State>;
    readonly htmlText: string;
}

export default class PageRenderer
{
    private readonly rawClientHtml: string;
    private readonly store: DataStore<State>;
    private previousRenders: PreviousRender[] = [];

    constructor (rawClientHtml: string, store: DataStore<State>)
    {
        this.rawClientHtml = rawClientHtml;
        this.store = store;

        this.store.subscribeAny(() =>
        {
            this.previousRenders = [];
        });
    }

    public isPage(pageId?: string)
    {
        return pageId != undefined && this.store.state().pages.findIndex(c => c.id === pageId) >= 0;
    }

    public defaultPage()
    {
        return this.store.state().selectedPageId;
    }

    public render(withPartialStore: Partial<State>)
    {
        const state = Object.assign({}, this.store.state(), withPartialStore);
        const previousRender = this.findPreviousState(state);

        if (!previousRender)
        {
            const ssrDomDocument = new SSRDomDocument();
            const ssrVDom = new VDom(ssrDomDocument);
            VDom.current = ssrVDom;

            const clientDoc = parse(this.rawClientHtml);
            const bodyEl = clientDoc.querySelector('body');

            if (state.darkTheme)
            {
                bodyEl.setAttribute('class', 'dark-theme');
            }

            const parent = SSRDomDocument.emptyElement();

            render(vdom(App, { state }), parent);
            const parsedParent = parse(parent.hydrateToString());

            bodyEl.insertAdjacentHTML('afterbegin', `<script>window.__state=${JSON.stringify(state)}</script>`);
            bodyEl.insertAdjacentHTML('beforebegin', this.createBackgroundStyles());

            bodyEl.childNodes.splice(0, 0, parsedParent);
            const htmlText = clientDoc.toString();
            this.previousRenders.push({ htmlText, state });

            console.log('New render response for: ', withPartialStore);

            return htmlText;
        }

        console.log('Cached previous render response for: ', withPartialStore);
        return previousRender.htmlText;
    }

    private findPreviousState(withPartialState: Partial<State>)
    {
        for (let i = 0; i < this.previousRenders.length; i++)
        {
            const previousRender = this.previousRenders[i];
            if (equal(previousRender.state, withPartialState))
            {
                return previousRender;
            }
        }

        return undefined;
    }

    private createBackgroundStyles()
    {
        let lightThemeRule = '';
        let darkThemeRule = '';
        const { backgrounds }  = this.store.state();
        if (backgrounds.light.length > 0)
        {
            const index = Math.floor(Math.random() * backgrounds.light.length);
            lightThemeRule = `body { background-image: url('${backgrounds.light[index]}') }`;
        }
        if (backgrounds.dark.length > 0)
        {
            const index = Math.floor(Math.random() * backgrounds.dark.length);
            darkThemeRule = `body.dark-theme { background-image: url('${backgrounds.dark[index]}') }`;
        }

        if (lightThemeRule && darkThemeRule)
        {
            return `<style>${lightThemeRule}\n${darkThemeRule}</style>`;
        }

        return '';
    }
}