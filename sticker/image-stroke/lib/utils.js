const utilsGl = {
    clear() {
        console.log('todo');
    },
    drawImage() {
        console.log('todo');
    }
};
const utils2d = {
    clear(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },
    drawImage(ctx, image, x, y) {
        ctx.drawImage(image, x, y);
    }
};
export const utils = {
    clear(ctx) {
        if (ctx instanceof CanvasRenderingContext2D) {
            utils2d.clear(ctx);
        }
        else if (ctx instanceof WebGLRenderingContext) {
            utilsGl.clear(ctx);
        }
    },
    drawImage(ctx, image, x, y) {
        if (ctx instanceof CanvasRenderingContext2D) {
            utils2d.drawImage(ctx, image, x, y);
        }
        else if (ctx instanceof WebGLRenderingContext) {
            utilsGl.drawImage(ctx, image, x, y);
        }
    }
};
