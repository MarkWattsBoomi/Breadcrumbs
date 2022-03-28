import { eLoadingState, FlowComponent, FlowField } from 'flow-component-model';
import * as React from 'react';
import "./breadcrumb.css";

declare var manywho: any;

export default class Breadcrumb extends FlowComponent {

    element: HTMLDivElement;
    lastContent = (<div className="bread"/>);
    paths: any[] = [];
    trail: any[] = [];

    constructor(props: any) {
        super(props);
        this.crumbClicked = this.crumbClicked.bind(this);
        this.buildPaths = this.buildPaths.bind(this);
    }

    async componentDidMount() {
        await super.componentDidMount();
        await this.buildPaths();
        this.forceUpdate();
    }

    async crumbClicked(e: any, name: string) {
        this.setStateValue(name);
        if(this.outcomes.OnClick && name){
            await this.triggerOutcome("OnClick");
        }
    }

    async getLabel(label: string) : Promise<string> {
        // use regex to find any {{}} tags in content and save them in matches
        let match: any;
        const matches: any[] = [];
        while (match = RegExp(/{{([^}]*)}}/).exec(label)) {
            let fld: FlowField = await this.loadValue(match[1]);
            if (fld) {
                label = label.replace(match[0], fld.value as string);
            }
        }
        return label;
    }

    async buildPaths() {
        this.trail = [];
        this.paths=[];
        let pathStr = this.attributes.path?.value;
        let path: any;
        if(pathStr) {
            try {
                path = JSON.parse(pathStr);
                while(path){
                    let label: string = await this.getLabel(path.label);
                    this.paths.push({label: label, value: path.value})
                    path=path.child;
                }
                this.paths.forEach((path: any) => {
                    if(this.trail.length>0){
                        this.trail.push(<div className="bread-crumb-spacer">{" / "}</div>);
                    }
                    if(path.value){
                        this.trail.push(
                            <div
                                className="bread-crumb"
                                onClick={
                                    (event: any) => {
                                        this.crumbClicked(event, path.value);
                                    }
                                }
                            >
                                {path.label}
                            </div>
                        );
                    }
                    else {
                        this.trail.push(
                            <div
                                className="bread-nocrumb"
                            >
                                {path.label}
                            </div>
                        );
                    }
                })
            }
            catch(e){
                console.log(e);
            }
        }
    }

    render() {

        if(this.loadingState === eLoadingState.ready){           
            this.lastContent = (
                <div
                    className="bread"
                >
                    {this.trail}
                </div>
            );
        }
        return this.lastContent;
    }
}

manywho.component.register("Breadcrumb", Breadcrumb);
