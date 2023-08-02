import { eContentType, eLoadingState, FlowComponent, FlowField, FlowObjectData } from 'flow-component-model';
import * as React from 'react';
import "./breadcrumb.css";

declare var manywho: any;

export default class Breadcrumb extends FlowComponent {

    element: HTMLDivElement;
    paths: any[] = [];
    home: any;
    favorite: any;
    flds: Map<string,FlowField>;
    homeFlow: string;
    setHomeOutcome: string;
    flowId: string;

    constructor(props: any) {
        super(props);
        this.crumbClicked = this.crumbClicked.bind(this);
        this.buildPaths = this.buildPaths.bind(this);
        this.moveHappened = this.moveHappened.bind(this);
        this.goHome = this.goHome.bind(this);
        this.setHome = this.setHome.bind(this);
    }

    async componentDidMount() {
        await super.componentDidMount();
        (manywho as any).eventManager.addDoneListener(this.moveHappened, this.componentId);
        await this.buildPaths();
        this.forceUpdate();
    }

    async componentWillUnmount(): Promise<void> {
        (manywho as any).eventManager.removeDoneListener(this.componentId);
    }

    async moveHappened(xhr: XMLHttpRequest, request: any) {
        if ((xhr as any).invokeType === 'FORWARD') {
            await this.buildPaths();
            this.forceUpdate();
        }
    }

    async crumbClicked(e: any, name: string) {
        this.setStateValue(name);
        if(Object.keys(this.outcomes)[0] && name){
            await this.triggerOutcome(Object.keys(this.outcomes)[0]);
        }
    }

    async goHome(e: any) {
        e.stopPropagation();
        this.setStateValue(this.homeFlow);
        if(Object.keys(this.outcomes)[0] && this.homeFlow){
            await this.triggerOutcome(Object.keys(this.outcomes)[0]);
        }
    }

    async setHome() {
        if(this.setHomeOutcome && this.outcomes[this.setHomeOutcome]){
            await this.triggerOutcome(this.outcomes[this.setHomeOutcome].developerName);
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
            if(!this.flds.has(fldElements[0])){
                fld = await this.loadValue(fldElements[0]);
                this.flds.set(fldElements[0], fld);
            }
            else {
                fld = this.flds.get(fldElements[0]);
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

    async buildPaths() : Promise<any> {
        
        this.paths=[];
        this.flds=new Map();
        let pathStr = this.attributes.path?.value;
        let flowIdStr: string = this.attributes.flowId?.value;
        let userId = this.attributes.userId?.value;
        this.homeFlow = this.attributes.homeFlow?.value;
        this.setHomeOutcome = this.attributes.setHomeOutcome?.value;
 
                

        if(flowIdStr.startsWith("{{")) {
            this.flowId = await this.getLabel(flowIdStr);
        }

        if(pathStr.startsWith("{{")) {
            pathStr = await this.getLabel(pathStr);
        }

        if(userId?.startsWith("{{")) {
            userId = await this.getLabel(userId);
        }

        if(this.homeFlow?.startsWith("{{")) {
            this.homeFlow = await this.getLabel(this.homeFlow);
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
            }
            catch(e){
                console.log(e);
            }
        }
        return 1;
    }

    render() {
        let home: any;
        let fav: any;
        let trail: any[] = [];
        if(this.homeFlow){
            if(this.homeFlow===this.flowId){
                home=(
                    <span 
                        className='bread-home glyphicon glyphicon-home'
                        title="You are already in your home module"
                    />
                );
            }
            else {
                home=(
                    <span 
                        className='bread-home bread-home-hot glyphicon glyphicon-home'
                        title="Go to home flow"
                        onClick={this.goHome}
                    />
                );
                if(this.outcomes[this.setHomeOutcome]){
                    fav=(
                        <span 
                            className='bread-fav bread-fav-hot glyphicon glyphicon-star-empty'
                            title="Make this your home module"
                            onClick={this.setHome}
                        />
                    );
                }
            }
        }

        let sepChar: string = this.attributes.separatorString?.value || " / ";
        let crumbAttributeName: string = this.getAttribute("selectedCrumbAttribute","flowid"); 
        this.paths.forEach((path: any) => {
            if(trail.length>0){
                trail.push(<div className="bread-crumb-spacer">{sepChar}</div>);
            }
            if(path.value){
                let crumbId: string = path[crumbAttributeName]?path[crumbAttributeName]:path.value;
                trail.push(
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
                trail.push(
                    <div
                        className="bread-nocrumb"
                    >
                        {path.label}
                    </div>
                );
            }
        })
        
        return (
            <div
                className="bread"
            >
                {home}
                {trail}
                {fav}
            </div>
        );
    }
}

manywho.component.register("Breadcrumb", Breadcrumb);
