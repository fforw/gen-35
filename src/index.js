import domready from "domready"
import "./style.css"
import { randomPaletteWithBlack } from "./randomPalette";
import weightedRandom from "./weightedRandom";


const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};

/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;


function randomGradientFromPalette(palette, x0, y0, x1, y1)
{
    const gradient = ctx.createLinearGradient(x0,y0,x1,y1)
    let indexA, indexB
    do
    {
        indexA = 0 | Math.random() * palette.length;
        indexB = 0 | Math.random() * palette.length;
    } while (indexA === indexB)

    gradient.addColorStop(0, palette[indexA])
    gradient.addColorStop(1, palette[indexB])
    return gradient
}


function randomGradient(palette)
{
    const { width, height } = config

    let gradient
    if (Math.random() < 0.5)
    {
        return randomGradientFromPalette(palette, 0,0,0, height)
    }
    else
    {

        return randomGradientFromPalette(palette, 0,0,width, 0)
    }

}

const randomRadius = weightedRandom([
    0.5, () => 0.0025,
    0.5, () => 0.01,
    2, () => 0.025 + Math.random() * 0.025,
    1, () => 0.06 + Math.random() * 0.06,
])

const randomCircle = weightedRandom([
    1, (palette, px, py, r) => {
        ctx.fillStyle = palette[0 | Math.random() * palette.length]
        ctx.beginPath()
        ctx.moveTo(px + r, py)
        ctx.arc(px, py, r, 0, TAU, true)
        ctx.fill()
    },
    0.5, (palette, px, py, r) => {
        ctx.strokeStyle = palette[0 | Math.random() * palette.length]
        ctx.beginPath()
        ctx.moveTo(px + r, py)
        ctx.arc(px, py, r, 0, TAU, true)
        ctx.stroke()
    },
    1, (palette, px, py, r) => {

        const angle = Math.random() * TAU

        const x0 = px + Math.cos(angle) * r
        const y0 = py + Math.sin(angle) * r
        const x1 = px + Math.cos(angle + TAU/2) * r
        const y1 = py + Math.sin(angle + TAU/2) * r

        ctx.fillStyle = randomGradientFromPalette(palette, x0, y0, x1, y1)
        ctx.beginPath()
        ctx.moveTo(px + r, py)
        ctx.arc(px, py, r, 0, TAU, true)
        ctx.fill()
    },
])

domready(
    () => {

        canvas = document.getElementById("screen");
        ctx = canvas.getContext("2d");

        const width = (window.innerWidth) | 0;
        const height = (window.innerHeight) | 0;

        config.width = width;
        config.height = height;

        canvas.width = width;
        canvas.height = height;


        function clipMask()
        {
            let angle = TAU * Math.random();
            const ratio = 1 / PHI
            const spread = TAU / 4
            const ratioSq = ratio * ratio
            const numArms = Math.floor(3 + Math.random() * 2)
            ctx.beginPath()
            for (let i = 0; i < numArms; i++)
            {
                let px = width * Math.random()
                let py = height * Math.random()
                let size = Math.min(width, height) * 0.365

                const numBlobs = Math.round(3 + Math.random())

                let angle2 = angle + i * TAU / numArms
                for (let j = 0; j < numBlobs; j++)
                {
                    ctx.fillStyle = "#f00"
                    ctx.moveTo(px + size, py)
                    ctx.arc(px, py, size, 0, TAU, true)

                    const smallerSize = size * (ratioSq + Math.random() * (ratio - ratioSq) * 2)

                    const d = Math.random() < 0.75 ? size * 1.1 + smallerSize : size * 0.75 + smallerSize

                    px += Math.cos(angle2) * d
                    py += Math.sin(angle2) * d
                    size = smallerSize

                    angle2 += -spread / 2 + Math.random() * spread
                }
            }
            ctx.clip()
        }


        function randomCircles(palette)
        {
            const numCircles = 25 + Math.random() * 25
            for (let j = 0; j < numCircles; j++)
            {
                const r = randomRadius() * Math.min(width, height)
                let px = width * Math.random()
                let py = height * Math.random()

                randomCircle(palette, px, py, r)

            }
        }


        const paint = () => {
            const palette = randomPaletteWithBlack()
            ctx.fillStyle = randomGradient(palette)
            ctx.fillRect(0, 0, width, height);

            randomCircles(palette);

            ctx.save()
            clipMask();
            ctx.fillStyle = randomGradient(palette)
            ctx.fillRect(0, 0, width, height);

            randomCircles(palette);
            ctx.restore()

        };


        paint();


        canvas.addEventListener("click", paint, true)
    }
);
