import { ClassComponent, vdom } from "simple-tsx-vdom";
import { PageState } from "../store";
import NavbarPageButton from "./navbar-page-button";
import './navbar.scss';

interface Props
{
    readonly pages: PageState[];
    readonly onPageChange: (page: PageState) => void;
}

export class Navbar extends ClassComponent<Props>
{
    public render()
    {
        const { pages } = this.props;

        return <nav class='navbar'>
            <h1>Alan Lawrey</h1>
            <div class='navbar__page-buttons'>
                { pages.map(page => <NavbarPageButton page={page} onClick={this.onClickPage} />) }
            </div>
        </nav>
    }

    private onClickPage = (page: PageState) =>
    {
        this.props.onPageChange(page);
    }
}