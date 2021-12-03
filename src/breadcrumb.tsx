import { eLoadingState, FlowComponent } from 'flow-component-model';
import * as React from 'react';
import "./breadcrumb.css";

declare var manywho: any;

export default class Breadcrumb extends FlowComponent {

    element: HTMLDivElement;
    lastContent = (<div className="breadcrumb"/>);
    paths: any[] = [];

    constructor(props: any) {
        super(props);
        this.crumbClicked = this.crumbClicked.bind(this);
    }

    async componentDidMount() {
        await super.componentDidMount();
        this.forceUpdate();
    }

    async crumbClicked(e: any, name: string) {
        this.setStateValue(name);
        if(this.outcomes.OnClick && name){
            await this.triggerOutcome("OnClick");
        }
    }

    render() {

        if(this.loadingState === eLoadingState.ready){
            let trail: any[] = [];
            this.paths=[];
            let pathStr = this.attributes.path?.value;
            let path: any;
            if(pathStr) {
                try {
                    path = JSON.parse(pathStr);
                    while(path){
                        this.paths.push({label: path.label, value: path.value})
                        path=path.child;
                    }
                    this.paths.forEach((path: any) => {
                        if(trail.length>0){
                            trail.push(<div className="bread-crumb-spacer">{" / "}</div>);
                        }
                        if(path.value){
                            trail.push(
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
                            trail.push(
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


            
            this.lastContent = (
                <div
                    className="bread"
                >
                    {trail}
                </div>
            );
        }
        return this.lastContent;
    }
}

manywho.component.register("Breadcrumb", Breadcrumb);
