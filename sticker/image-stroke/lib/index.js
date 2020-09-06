import { utils } from './utils';
export default class ImageStroke {
    constructor(method) {
        this.canvas = null;
        this.use(method);
    }
    use(method) {
        this.method = method;
    }
    make(image, options) {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
        }
        const { canvas } = this;
        const ctx = this.getContext();
        const strokeSize = options.thickness * 2;
        const [resultWidth, resultHeight] = [image.width, image.height].map((val) => val + strokeSize);
        if (resultWidth !== canvas.width || resultHeight !== canvas.height) {
            canvas.width = resultWidth;
            canvas.height = resultHeight;
        }
        utils.clear(ctx);
        this.method.exec(ctx, image, options);
        utils.drawImage(ctx, image, options.thickness, options.thickness);
        return canvas;
    }
    getContext() {
        switch (this.method.context) {
            case 'gl':
                return this.canvas.getContext('gl');
            case '2d':
                return this.canvas.getContext('2d');
        }
    }
}
