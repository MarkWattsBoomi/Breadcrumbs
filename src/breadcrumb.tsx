import { eContentType, eLoadingState, FlowComponent, FlowField, FlowObjectData } from 'flow-component-model';
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
        if(Object.keys(this.outcomes)[0] && name){
            await this.triggerOutcome(Object.keys(this.outcomes)[0]);
        }
    }

    async getLabel(label: string) : Promise<string> {
        // use regex to find any {{}} tags in content and save them in matches
        let contentType: eContentType;
        let value: any;
        let match: any;
        const matches: any[] = [];
        while (match = RegExp(/{{([^}]*)}}/).exec(label)) {
            const fldElements: string[] = match[1].split('->');
            let fld: FlowField;
            if (this.fields[fldElements[0]]) {
                fld = this.fields[fldElements[0]];
            } else {
                fld = await this.loadValue(fldElements[0]);
            }

            if (fld) {
                let od: FlowObjectData = fld.value as FlowObjectData;
                if (od) {
                    if (fldElements.length > 1) {
                        for (let epos = 1 ; epos < fldElements.length ; epos ++) {
                            contentType = (od as FlowObjectData).properties[fldElements[epos]]?.contentType;
                            od = (od as FlowObjectData).properties[fldElements[epos]].value as FlowObjectData;
                        }
                        value = od;
                    } else {
                        value = fld.value;
                        contentType = fld.contentType;
                    }
                } else {
                    value = fld.value;
                    contentType = fld.contentType;
                }
                label = label.replace(match[0], value);
            }
        }
        return label;
    }

    async buildPaths() {
        this.trail = [];
        this.paths=[];
        let pathStr = this.attributes.path?.value;
        let moduleStr = this.attributes.module?.value;
        let modeStr = this.attributes.mode?.value;
        let opStr: string;
        let sepChar: string = this.attributes.separatorString?.value || " / ";
        let crumbAttributeName: string = this.getAttribute("selectedCrumbAttribute","flowid"); 
       

        if(pathStr.startsWith("{{")) {
            pathStr = await this.getLabel(pathStr);
        }
        
        let path: any;
        if(pathStr) {
            try {
                path = JSON.parse(pathStr);
                while(path){
                    let label: string = await this.getLabel(path.label);
                    this.paths.push({label: label, value: path.value, flowid: path.flowid})
                    path=path.child;
                }
                this.paths.forEach((path: any) => {
                    if(this.trail.length>0){
                        this.trail.push(<div className="bread-crumb-spacer">{sepChar}</div>);
                    }
                    if(path.value){
                        let crumbId: string = path[crumbAttributeName]?path[crumbAttributeName]:path.value;
                        this.trail.push(
                            <div
                                className="bread-crumb"
                                onClick={
                                    (event: any) => {
                                        this.crumbClicked(event, crumbId);
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
