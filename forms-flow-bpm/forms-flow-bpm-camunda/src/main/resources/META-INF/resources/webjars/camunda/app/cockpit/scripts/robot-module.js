function ___$insertStylesToHeader(css) {
  if (!css) {
    return
  }
  if (typeof window === 'undefined') {
    return
  }

  const style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);
  return css
}

/**
 * @typedef { import('../model/Types').Element } Element
 * @typedef { import('../model/Types').ModdleElement } ModdleElement
 */

/**
 * Is an element of the given BPMN type?
 *
 * @param  {Element|ModdleElement} element
 * @param  {string} type
 *
 * @return {boolean}
 */
function is(element, type) {
  var bo = getBusinessObject(element);

  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}

/**
 * Return the business object for a given element.
 *
 * @param {Element|ModdleElement} element
 *
 * @return {ModdleElement}
 */
function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

var DEFAULT_RENDER_PRIORITY = 1000;

/**
 * @typedef {import('../core/Types').ElementLike} Element
 * @typedef {import('../core/Types').ConnectionLike} Connection
 * @typedef {import('../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../core/EventBus').default} EventBus
 */

/**
 * The base implementation of shape and connection renderers.
 *
 * @param {EventBus} eventBus
 * @param {number} [renderPriority=1000]
 */
function BaseRenderer(eventBus, renderPriority) {
  var self = this;

  renderPriority = renderPriority || DEFAULT_RENDER_PRIORITY;

  eventBus.on([ 'render.shape', 'render.connection' ], renderPriority, function(evt, context) {
    var type = evt.type,
        element = context.element,
        visuals = context.gfx,
        attrs = context.attrs;

    if (self.canRender(element)) {
      if (type === 'render.shape') {
        return self.drawShape(visuals, element, attrs);
      } else {
        return self.drawConnection(visuals, element, attrs);
      }
    }
  });

  eventBus.on([ 'render.getShapePath', 'render.getConnectionPath' ], renderPriority, function(evt, element) {
    if (self.canRender(element)) {
      if (evt.type === 'render.getShapePath') {
        return self.getShapePath(element);
      } else {
        return self.getConnectionPath(element);
      }
    }
  });
}

/**
 * Checks whether an element can be rendered.
 *
 * @param {Element} element The element to be rendered.
 *
 * @return {boolean} Whether the element can be rendered.
 */
BaseRenderer.prototype.canRender = function(element) {};

/**
 * Draws a shape.
 *
 * @param {SVGElement} visuals The SVG element to draw the shape into.
 * @param {Shape} shape The shape to be drawn.
 *
 * @return {SVGElement} The SVG element of the shape drawn.
 */
BaseRenderer.prototype.drawShape = function(visuals, shape) {};

/**
 * Draws a connection.
 *
 * @param {SVGElement} visuals The SVG element to draw the connection into.
 * @param {Connection} connection The connection to be drawn.
 *
 * @return {SVGElement} The SVG element of the connection drawn.
 */
BaseRenderer.prototype.drawConnection = function(visuals, connection) {};

/**
 * Gets the SVG path of the graphical representation of a shape.
 *
 * @param {Shape} shape The shape.
 *
 * @return {string} The SVG path of the shape.
 */
BaseRenderer.prototype.getShapePath = function(shape) {};

/**
 * Gets the SVG path of the graphical representation of a connection.
 *
 * @param {Connection} connection The connection.
 *
 * @return {string} The SVG path of the connection.
 */
BaseRenderer.prototype.getConnectionPath = function(connection) {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var inherits_browser = {exports: {}};

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  inherits_browser.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  };
} else {
  // old school shim for old browsers
  inherits_browser.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }
  };
}

var inherits_browserExports = inherits_browser.exports;
var inherits = /*@__PURE__*/getDefaultExportFromCjs(inherits_browserExports);

function ensureImported(element, target) {

  if (element.ownerDocument !== target.ownerDocument) {
    try {

      // may fail on webkit
      return target.ownerDocument.importNode(element, true);
    } catch (e) {

      // ignore
    }
  }

  return element;
}

/**
 * appendTo utility
 */

/**
 * Append a node to a target element and return the appended node.
 *
 * @param  {SVGElement} element
 * @param  {SVGElement} target
 *
 * @return {SVGElement} the appended node
 */
function appendTo(element, target) {
  return target.appendChild(ensureImported(element, target));
}

/**
 * append utility
 */

/**
 * Append a node to an element
 *
 * @param  {SVGElement} element
 * @param  {SVGElement} node
 *
 * @return {SVGElement} the element
 */
function append(target, node) {
  appendTo(node, target);
  return target;
}

/**
 * attribute accessor utility
 */

var LENGTH_ATTR = 2;

var CSS_PROPERTIES = {
  'alignment-baseline': 1,
  'baseline-shift': 1,
  'clip': 1,
  'clip-path': 1,
  'clip-rule': 1,
  'color': 1,
  'color-interpolation': 1,
  'color-interpolation-filters': 1,
  'color-profile': 1,
  'color-rendering': 1,
  'cursor': 1,
  'direction': 1,
  'display': 1,
  'dominant-baseline': 1,
  'enable-background': 1,
  'fill': 1,
  'fill-opacity': 1,
  'fill-rule': 1,
  'filter': 1,
  'flood-color': 1,
  'flood-opacity': 1,
  'font': 1,
  'font-family': 1,
  'font-size': LENGTH_ATTR,
  'font-size-adjust': 1,
  'font-stretch': 1,
  'font-style': 1,
  'font-variant': 1,
  'font-weight': 1,
  'glyph-orientation-horizontal': 1,
  'glyph-orientation-vertical': 1,
  'image-rendering': 1,
  'kerning': 1,
  'letter-spacing': 1,
  'lighting-color': 1,
  'marker': 1,
  'marker-end': 1,
  'marker-mid': 1,
  'marker-start': 1,
  'mask': 1,
  'opacity': 1,
  'overflow': 1,
  'pointer-events': 1,
  'shape-rendering': 1,
  'stop-color': 1,
  'stop-opacity': 1,
  'stroke': 1,
  'stroke-dasharray': 1,
  'stroke-dashoffset': 1,
  'stroke-linecap': 1,
  'stroke-linejoin': 1,
  'stroke-miterlimit': 1,
  'stroke-opacity': 1,
  'stroke-width': LENGTH_ATTR,
  'text-anchor': 1,
  'text-decoration': 1,
  'text-rendering': 1,
  'unicode-bidi': 1,
  'visibility': 1,
  'word-spacing': 1,
  'writing-mode': 1
};


function getAttribute(node, name) {
  if (CSS_PROPERTIES[name]) {
    return node.style[name];
  } else {
    return node.getAttributeNS(null, name);
  }
}

function setAttribute(node, name, value) {
  var hyphenated = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  var type = CSS_PROPERTIES[hyphenated];

  if (type) {

    // append pixel unit, unless present
    if (type === LENGTH_ATTR && typeof value === 'number') {
      value = String(value) + 'px';
    }

    node.style[hyphenated] = value;
  } else {
    node.setAttributeNS(null, name, value);
  }
}

function setAttributes(node, attrs) {

  var names = Object.keys(attrs), i, name;

  for (i = 0, name; (name = names[i]); i++) {
    setAttribute(node, name, attrs[name]);
  }
}

/**
 * Gets or sets raw attributes on a node.
 *
 * @param  {SVGElement} node
 * @param  {Object} [attrs]
 * @param  {String} [name]
 * @param  {String} [value]
 *
 * @return {String}
 */
function attr(node, name, value) {
  if (typeof name === 'string') {
    if (value !== undefined) {
      setAttribute(node, name, value);
    } else {
      return getAttribute(node, name);
    }
  } else {
    setAttributes(node, name);
  }

  return node;
}

var ns = {
  svg: 'http://www.w3.org/2000/svg'
};

/**
 * DOM parsing utility
 */

var SVG_START = '<svg xmlns="' + ns.svg + '"';

function parse(svg) {

  var unwrap = false;

  // ensure we import a valid svg document
  if (svg.substring(0, 4) === '<svg') {
    if (svg.indexOf(ns.svg) === -1) {
      svg = SVG_START + svg.substring(4);
    }
  } else {

    // namespace svg
    svg = SVG_START + '>' + svg + '</svg>';
    unwrap = true;
  }

  var parsed = parseDocument(svg);

  if (!unwrap) {
    return parsed;
  }

  var fragment = document.createDocumentFragment();

  var parent = parsed.firstChild;

  while (parent.firstChild) {
    fragment.appendChild(parent.firstChild);
  }

  return fragment;
}

function parseDocument(svg) {

  var parser;

  // parse
  parser = new DOMParser();
  parser.async = false;

  return parser.parseFromString(svg, 'text/xml');
}

/**
 * Create utility for SVG elements
 */


/**
 * Create a specific type from name or SVG markup.
 *
 * @param {String} name the name or markup of the element
 * @param {Object} [attrs] attributes to set on the element
 *
 * @returns {SVGElement}
 */
function create(name, attrs) {
  var element;

  if (name.charAt(0) === '<') {
    element = parse(name).firstChild;
    element = document.importNode(element, true);
  } else {
    element = document.createElementNS(ns.svg, name);
  }

  if (attrs) {
    attr(element, attrs);
  }

  return element;
}

var img = "data:image/svg+xml,%3c%3fxml version='1.0' encoding='UTF-8' standalone='no'%3f%3e%3csvg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns%23' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 202.4325 202.34125' height='202.34125' width='202.4325' xml:space='preserve' version='1.1' id='svg2'%3e%3cmetadata id='metadata8'%3e%3crdf:RDF%3e%3ccc:Work rdf:about=''%3e%3cdc:format%3eimage/svg%2bxml%3c/dc:format%3e%3cdc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage' /%3e%3c/cc:Work%3e%3c/rdf:RDF%3e%3c/metadata%3e%3cdefs id='defs6'%3e%3cclipPath id='clipPath16' clipPathUnits='userSpaceOnUse'%3e%3cpath id='path18' d='m 0%2c161.873 161.946%2c0 L 161.946%2c0 0%2c0 0%2c161.873 Z' /%3e%3c/clipPath%3e%3c/defs%3e%3cg transform='matrix(1.25%2c0%2c0%2c-1.25%2c0%2c202.34125)' id='g10'%3e%3cg id='g12'%3e%3cg clip-path='url(%23clipPath16)' id='g14'%3e%3cg transform='translate(52.4477%2c88.1268)' id='g20'%3e%3cpath id='path22' style='fill:black%3bfill-opacity:1%3bfill-rule:nonzero%3bstroke:none' d='m 0%2c0 c 0%2c7.6 6.179%2c13.779 13.77%2c13.779 7.6%2c0 13.779%2c-6.179 13.779%2c-13.779 0%2c-2.769 -2.238%2c-5.007 -4.998%2c-5.007 -2.761%2c0 -4.999%2c2.238 -4.999%2c5.007 0%2c2.078 -1.695%2c3.765 -3.782%2c3.765 C 11.693%2c3.765 9.997%2c2.078 9.997%2c0 9.997%2c-2.769 7.76%2c-5.007 4.999%2c-5.007 2.238%2c-5.007 0%2c-2.769 0%2c0 m 57.05%2c-23.153 c 0%2c-2.771 -2.237%2c-5.007 -4.998%2c-5.007 l -46.378%2c0 c -2.761%2c0 -4.999%2c2.236 -4.999%2c5.007 0%2c2.769 2.238%2c5.007 4.999%2c5.007 l 46.378%2c0 c 2.761%2c0 4.998%2c-2.238 4.998%2c-5.007 M 35.379%2c-2.805 c -1.545%2c2.291 -0.941%2c5.398 1.35%2c6.943 l 11.594%2c7.83 c 2.273%2c1.58 5.398%2c0.941 6.943%2c-1.332 1.545%2c-2.29 0.941%2c-5.398 -1.35%2c-6.943 l -11.594%2c-7.83 c -0.852%2c-0.586 -1.829%2c-0.87 -2.788%2c-0.87 -1.607%2c0 -3.187%2c0.781 -4.155%2c2.202 m 31.748%2c-30.786 c 0%2c-0.945 -0.376%2c-1.852 -1.045%2c-2.522 l -8.617%2c-8.617 c -0.669%2c-0.668 -1.576%2c-1.045 -2.523%2c-1.045 l -52.833%2c0 c -0.947%2c0 -1.854%2c0.377 -2.523%2c1.045 l -8.617%2c8.617 c -0.669%2c0.67 -1.045%2c1.577 -1.045%2c2.522 l 0%2c52.799 c 0%2c0.947 0.376%2c1.854 1.045%2c2.522 l 8.617%2c8.619 c 0.669%2c0.668 1.576%2c1.044 2.523%2c1.044 l 52.833%2c0 c 0.947%2c0 1.854%2c-0.376 2.523%2c-1.044 l 8.617%2c-8.619 c 0.669%2c-0.668 1.045%2c-1.575 1.045%2c-2.522 l 0%2c-52.799 z m 7.334%2c61.086 -11.25%2c11.25 c -1.705%2c1.705 -4.018%2c2.663 -6.428%2c2.663 l -56.523%2c0 c -2.412%2c0 -4.725%2c-0.959 -6.43%2c-2.665 L -17.412%2c27.494 c -1.704%2c-1.705 -2.661%2c-4.016 -2.661%2c-6.427 l 0%2c-56.515 c 0%2c-2.411 0.958%2c-4.725 2.663%2c-6.428 l 11.25%2c-11.25 c 1.705%2c-1.705 4.017%2c-2.662 6.428%2c-2.662 l 56.515%2c0 c 2.41%2c0 4.723%2c0.957 6.428%2c2.662 l 11.25%2c11.25 c 1.705%2c1.703 2.663%2c4.017 2.663%2c6.428 l 0%2c56.514 c 0%2c2.412 -0.958%2c4.724 -2.663%2c6.429' /%3e%3c/g%3e%3c/g%3e%3c/g%3e%3c/g%3e%3c/svg%3e";

var RobotTaskRenderer = /** @class */ (function () {
    function RobotTaskRenderer(eventBus, bpmnRenderer) {
        this.$inject = [];
        this.eventBus = eventBus;
        this.bpmnRenderer = bpmnRenderer;
        BaseRenderer.call(this, eventBus, 1500);
    }
    RobotTaskRenderer.prototype.canRender = function (element) {
        return is(element, 'bpmn:ServiceTask') && element.id.match(/robot/i);
    };
    RobotTaskRenderer.prototype.drawShape = function (parent, element) {
        this.bpmnRenderer.handlers['bpmn:Task'](parent, element);
        var gfx = create('image', {
            x: -1,
            y: -1,
            width: 32,
            height: 32,
            href: img,
        });
        append(parent, gfx);
        return gfx;
    };
    return RobotTaskRenderer;
}());
var factory = function (eventBus, bpmnRenderer) {
    var instance = new RobotTaskRenderer(eventBus, bpmnRenderer);
    inherits(instance, BaseRenderer);
    instance.$inject = ['eventBus', 'bpmnRenderer'];
    return instance;
};

var index = {
    __init__: ['RobotTaskRenderer'],
    RobotTaskRenderer: ['type', factory],
};

export { index as default };
