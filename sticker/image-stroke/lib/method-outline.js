// inspired by https://github.com/OSUblake/msqr/tree/master/npm
export function getContours(ctx) {
    const cx = 0;
    const cy = 0;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const paths = [];
    let lastPos = 3;
    const alpha = 100;
    const trace = () => {
        const path = [];
        const data = new Uint32Array(ctx.getImageData(cx, cy, canvasWidth, canvasHeight).data.buffer);
        let x;
        let y;
        let startX;
        let startY;
        let startPos = -1;
        let step;
        let prevStep = 9;
        const steps = [9, 0, 3, 3, 2, 0, 9, 3, 1, 9, 1, 1, 2, 0, 2, 9];
        let time = 50;
        function getState(x, y) {
            return x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight
                ? data[y * canvasWidth + x] >>> 24 > alpha
                : false;
        }
        function getNextStep(x, y) {
            let v = 0;
            if (getState(x - 1, y - 1)) {
                v += 1;
            }
            if (getState(x, y - 1)) {
                v += 2;
            }
            if (getState(x - 1, y)) {
                v += 4;
            }
            if (getState(x, y)) {
                v += 8;
            }
            if (time > 50) {
                time += 10;
            }
            else {
                time += 10;
            }
            if (v === 6)
                return prevStep === 0 ? 2 : 3;
            else if (v === 9)
                return prevStep === 3 ? 0 : 1;
            else
                return steps[v];
        }
        for (let i = lastPos; i < data.length; i++) {
            if (data[i] >>> 24 > alpha) {
                startPos = lastPos = i;
                break;
            }
        }
        if (startPos >= 0) {
            x = startX = startPos % canvasWidth;
            y = startY = Math.floor(startPos / canvasWidth);
            do {
                step = getNextStep(x, y);
                if (step === 0)
                    y--;
                else if (step === 1)
                    y++;
                else if (step === 2)
                    x--;
                else if (step === 3)
                    x++;
                if (step !== prevStep) {
                    path.push({ x: x + cx, y: y + cy });
                    prevStep = step;
                }
            } while (x !== startX || y !== startY);
        }
        paths.push(path);
        return path;
    };
    trace();
    return paths;
}
const canvas4Image = document.createElement('canvas');
const ctx4Image = canvas4Image.getContext('2d');
export default {
    context: '2d',
    exec(ctx, image, options) {
        canvas4Image.width = image.width;
        canvas4Image.height = image.height;
        ctx4Image.drawImage(image, 0, 0);
        const paths = getContours(ctx4Image);
        const x = options.thickness;
        const y = options.thickness;
        ctx.strokeStyle = options.color;
        ctx.lineWidth = options.thickness * 2;
        ctx.lineJoin = 'round';
        paths.forEach(path => {
            ctx.beginPath();
            ctx.moveTo(x + path[0].x, y + path[1].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(x + path[i].x, y + path[i].y);
            }
            ctx.closePath();
        });
        ctx.stroke();
    }
};
