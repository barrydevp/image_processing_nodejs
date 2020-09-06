export default {
    context: '2d',
    exec(ctx, image, options) {
        ctx.save();
        for (let i = 0; i < 360; i++) {
            ctx.drawImage(image, options.thickness * (1 + Math.cos(i)), options.thickness * (1 + Math.sin(i)));
        }
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = options.color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }
};
