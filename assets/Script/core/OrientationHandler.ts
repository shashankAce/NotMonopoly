const { ccclass, property } = cc._decorator;

const game_size = cc.size(540, 960);

@ccclass
export default class OrientationHandler extends cc.Component {

    @property(cc.Node)
    portraitNodes: cc.Node[] = [];

    @property(cc.Node)
    landscapeNodes: cc.Node[] = [];

    @property(cc.Node)
    mainNode: cc.Node = null;

    @property(cc.Node)
    nodesToResize: cc.Node[] = [];

    private isEnabled: boolean = true;

    private margin_w = 0.4;
    private margin_h = 0.1;

    protected onLoad(): void {
        // this.isEnabled = false;
        cc.view.setResizeCallback(() => {
            if (!this.isEnabled) {
                return;
            }
            this.updateSize();
            this.updateNodes();
        });
        this.updateSize();
        this.updateNodes();
    }

    updateNodes() {
        let size = cc.view.getCanvasSize();
        let isLandscape = size.width > size.height;
        ///
        this.landscapeNodes.forEach((node: cc.Node) => {
            node.active = isLandscape;
        });
        this.portraitNodes.forEach((node: cc.Node) => {
            node.active = !isLandscape;
        });
    }

    updateSize() {

        let size = cc.view.getCanvasSize();
        let game_scale = cc.view.getScaleX();

        if (size.width < size.height) {
            let scale_w = 1;
            this.mainNode.setScale(scale_w);
            let node_w = this.mainNode.width * game_scale;
            // if (size.width < node_w) {
                scale_w = size.width / node_w;
                this.mainNode.setScale(scale_w);
            // }
            this.resizeNodes(scale_w);

        } else {

            let margin_horiz = size.width * this.margin_w;
            let margin_vert = this.margin_h;

            ///
            let node_w = this.mainNode.width * game_scale;
            let screen_w = size.width - margin_horiz;
            let scale_w = screen_w / node_w;

            ///
            let node_h = this.mainNode.height * game_scale;
            let screen_h = size.height - margin_vert;
            let scale_h = screen_h / node_h;

            ///
            let final = scale_h > scale_w ? scale_w : scale_h;
            this.mainNode.setScale(final);

            ///
            this.resizeNodes(final);
        }
    }

    resizeNodes(scale: number) {
        this.nodesToResize.forEach((node) => {
            node.setScale(scale);
        });
    }
}