const defaultCircleOptions = {
  shouldFill: true,
  fillStyle: "black",
  lineWidth: 1,
  strokeStyle: "black",
  shouldStroke: true,
}

const defaultRectOptions = {
  fillStyle: null,
  strokeStyle: 'black',
}

const defaultLineOptions = {
  strokeStyle: "black"
}
const defaultTextOptions = {
  fillStyle: 'black',
  font: '12px'
}
class JdCanvasApi {
  constructor(context){
    this.context = context;
  }

  rotate(at){
    if(!at.rotation) return;
    this.context.translate(at.x, at.y);
    this.context.rotate(at.rotation * Math.PI/180);
    this.context.translate(-at.x, -at.y);
  }

  drawRect(at, width, height, options = {}){
    const opts = _.assign({}, defaultRectOptions, options);
    this.context.save();
    this.rotate(at);
    _.merge(this.context, opts);
    this.context.fillRect(
      at.x - (width/2),
      at.y - (height/2),
      width,
      height
    );

    this.context.restore();
  }

  drawLine(from, to, options = {}){
    const opts = _.assign({}, defaultLineOptions, options);
    this.context.save();
    _.merge(this.context, opts);
    this.context.beginPath();
    this.context.moveTo(from.x, from.y);
    this.context.lineTo(to.x, to.y);
    this.context.stroke();
    this.context.restore();
  }

  drawCircle(at, radius, options = {}){
    const opts = _.assign({}, defaultCircleOptions, options);
    this.context.save();
    _.merge(this.context, opts);
    this.context.beginPath();
    this.context.arc(at.x, at.y, radius, 0, 2 * Math.PI, false);
    opts.shouldFill && this.context.fill();
    opts.shouldStroke && this.context.stroke();
    this.context.restore();
  }

  drawText(at, text, options = {}){
    const opts = _.assign({}, defaultTextOptions, options);
    this.context.save();
    _.merge(this.context, opts);
    this.context.fillText(text, at.x, at.y);
    this.context.restore();
  }
}
