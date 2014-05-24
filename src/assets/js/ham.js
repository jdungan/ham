"use strict";

// add swipe up and dow to jquerymobile
//http://stackoverflow.com/questions/17131815/how-to-swipe-top-down-jquery-mobile
(function() {
  var supportTouch = $.support.touch,
    scrollEvent = "touchmove scroll",
    touchStartEvent = supportTouch ? "touchstart" : "mousedown",
    touchStopEvent = supportTouch ? "touchend" : "mouseup",
    touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
  $.event.special.swipeupdown = {
    setup: function() {
      var thisObject = this;
      var $this = $(thisObject);
      $this.bind(touchStartEvent, function(event) {
        var data = event.originalEvent.touches ?
          event.originalEvent.touches[0] :
          event,
          start = {
            time: (new Date).getTime(),
            coords: [data.pageX, data.pageY],
            origin: $(event.target)
          },
          stop;

        function moveHandler(event) {
          if (!start) {
            return;
          }
          var data = event.originalEvent.touches ?
            event.originalEvent.touches[0] :
            event;
          stop = {
            time: (new Date).getTime(),
            coords: [data.pageX, data.pageY]
          };

          // prevent scrolling
          if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
            event.preventDefault();
          }
        }
        $this
          .bind(touchMoveEvent, moveHandler)
          .one(touchStopEvent, function(event) {
            $this.unbind(touchMoveEvent, moveHandler);
            if (start && stop) {
              if (stop.time - start.time < 1000 &&
                Math.abs(start.coords[1] - stop.coords[1]) > 30 &&
                Math.abs(start.coords[0] - stop.coords[0]) < 75) {
                start.origin
                  .trigger("swipeupdown")
                  .trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "swipedown");
              }
            }
            start = stop = undefined;
          });
      });
    }
  };
  $.each({
    swipedown: "swipeupdown",
    swipeup: "swipeupdown"
  }, function(event, sourceEvent) {
    $.event.special[event] = {
      setup: function() {
        $(this).bind(sourceEvent, $.noop);
      }
    };
  });

})();

// location watch object

function Location() {
  var options = {
    enableHighAccuracy: true
  },
    inner_pos = {},
    dfd = new $.Deferred(),
    moved = function(pos) {
      inner_pos = pos || {};
      dfd.resolve()
    },
    fail = function(err) {
      if (err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
      }
      dfd.reject()
    };

  this.__defineGetter__("lat", function() {
    return inner_pos.coords ? inner_pos.coords.latitude : null;
  });

  this.__defineGetter__("lng", function() {

    return inner_pos.coords ? inner_pos.coords.longitude : null;
  });

  this.WatchID = navigator.geolocation.watchPosition(moved, fail, options);

  this.ready = dfd.promise()
}


// http://206.214.166.144/api/score/-95.9911,36.1498?callback=your_function

// creates a new api object in the global space
var ham = new(function api() {
  var dfd = new $.Deferred()

  this.loc = new Location();

  this.loc.__defineGetter__("position", function() {
    return this.lng + ',' + this.lat;
  });

  this.loc.ready.done(function() {
    return dfd.resolve()
  })

  this.ready = dfd.promise()

  var api_calls = [{
    'name': 'score',
    'uri': 'api/score/'
  },
  {
    'name': 'fake',
    'uri':'api/score-fake/'
  }
  ]

  this.options = this.options || {
    url: 'http://206.214.166.144/'
  };

  this.call_api = function(uri, ajax_params) {
    ajax_params = ajax_params || {};
    ajax_params.format='jsonp'
    return $.ajax({
      type: "get",
      url: this.options.url + uri + this.loc.position,
      data: ajax_params,
      dataType: 'jsonp'
    })
  };

  // setup simple api mappings
  api_calls.forEach(function(v, i) {
    api.prototype[v.name] = function(params) {
      return this.call_api(v.uri, params)
    }
  });

})()

//handy helpers
var arc2deg = function(x) {
  return 180 * (x / Math.PI)
}
var deg2arc = function(x) {
  return (Math.PI * 2) / x
}

var absDeg = function(newDegree) {
  return (newDegree % 360 + (newDegree >= 0 ? 0 : 360))
}

var fa_translate = function(name) {
  return String.fromCharCode(parseInt(fa_ucode[name], 16))
}

var fromCenter = function(radius, radians) {
  var r = radius,
    x = r * Math.sin(radians),
    y = r * Math.cos(radians);
  return {
    x: x,
    y: -y
  }
}
var clone_node = function(node, parent) {
  return d3.select(node.parentNode.insertBefore(node.cloneNode(true),
    node.nextSibling));
}

var scale_colors = {
    good: '#37D7B2',
    med: '#EBC355',
    bad: '#F86C5F'
}

var color_quantile = d3.scale.quantile()
    .domain([0,1])
    .range([scale_colors['bad'], scale_colors['med'], scale_colors['good']]);

var grade_quantile = d3.scale.quantile()
    .domain([0,1])
    .range(['F','F','F','F','F','F','F','D','C','B','A']);

//tranform function to be added to a d3 objects

function Transform(element) {
  var order = ['translate', 'scale', 'rotate'],
    inner = {
      translate: {
        value: {
          x: 0,
          y: 0
        },
        string: xyString,
        increment: xyIncrement
      },
      scale: {
        value: {
          x: 1,
          y: 1
        },
        string: xyString,
        increment: xyIncrement
      },
      rotate: {
        value: rotation,
        string: function() {
          return rotation()
        },
        increment:function(){return this;}
      }
    };


  function xyString() {
    return  this.value.x + ',' + this.value.y
  };

  function rotation(degree) {

    if (degree === undefined) {
      return rotation.value || 0;
    }

    if (degree != rotation.value) {
      rotation.value = Math.round((degree % 360 + (degree >= 0 ? 0 : 360)))
    }

    return rotation.value
  }

  function xyIncrement(transform){
    var this_transform = transform;

    return function(obj){
      if (obj.x||obj.x) { this().x += obj.x }
      if (obj.y||obj.y) { this().y += obj.y }
      return this_transform;
    }
  }

  // add getters and setters for transform types in the order array
  order.forEach(function(v) {
    this[v] = function(d) {
      var isFunction = (typeof inner[v].value === "function")

      if (d == undefined) {
        return isFunction ? inner[v].value() : inner[v].value
      };

      var new_value = (typeof d === 'function') ? d(element) : d

      isFunction ? inner[v].value(new_value) : inner[v].value = new_value

      return this;
    }

    this[v].incr = new inner[v].increment(this)

  }, this);


  this.render = function() {
    element.attr('transform', this.toString());
  }

  this.animate = function(options) {
    var options = options || {},
      duration = options.duration || 500,
      ease = options.ease || '',
      opacity = options.opacity || '1';

    return element.transition()
      .duration(duration)
      .ease(d3.ease(ease))
      .attr('transform', this.toString())
      .attr('opacity', opacity)
  }

  this.toString = function() {
    return order.map(
      function(v) {
        return v + '(' + inner[v].string() + ')'
      },
      this).join(' ');
  }

}


// d3 based controls

function Control(d3_select) {
  this.element = d3_select || [];
  this.transform = new Transform(d3_select);
  this.element.node().__transform__ = this.transform;
  this.move = function(pos) {
    this.transform
      .translate(pos)
      .animate({
        ease: 'cubic',
        duration: 800
      })
  }
}


function Grade(parent){
  if (parent){
    Control.call(this,parent
      .append('g')
    )

    this.circle =
      this.element.append('circle')
      .attr({
        r:25,
        opacity:'.8',
        fill:'green'
      })

    this.letter = this.element
      .append('text')
      .attr({'class':'grade'})
  }
}

Grade.prototype.grade = function(score){
  this.letter.text(grade_quantile(score));
  this.circle.attr({'fill': color_quantile(score)})
}

function Textbox(parent){
  if (parent){
    Control.call(this,parent
      .append('g')
      .append("foreignObject")
      .attr({
        height: 40,
        width:  320,
        'class': 'card-header'
      })
      .append("xhtml:body")
        // .style("font", "18px 'Helvetica'")
      .append("h3")
    )
  }
}

Textbox.prototype.text = function(string) {

  if (string===undefined){ return this.element.text()}

  return this.element.text(string)

}


function Icon(parent) {
  if (parent) {

    Control.apply(this,[parent.append('text')])

    this.element
      .attr({
        'class': 'fa-icon dont_select',
        'font-family': 'FontAwesome',
        'font-size': '20px',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'opacity': '1'
      })
  }
}

Icon.prototype.fa_type =
  function(name) {
    this.element.text(
      String.fromCharCode(parseInt(fa_ucode[name], 16)
    ))
    return this;
}


function Card(parent) {

  if (parent) {

    Control.apply(this,[parent.insert('g', ":first-child")]);

    var c=this.element,
        h = parent.attr('height'),
        w = parent.attr('width');
    this.element.attr('class', 'card');

    // c.datum({h : h, w : w});

    c.append('rect').attr({
        'class': 'card-body',
        height: h,
        width: w
      })

      this.title = new Textbox(c)

      this.strip = new Strip(this)
      this.strip.transform.translate({x:50,y:50}).render()

      this.icon = new Icon(c).fa_type('chevron-down')
      this.icon.transform.translate({x:w/2,y:50}).render()

      // this.footer = new Textbox(c)

  }


}

Card.prototype.update = function(data){

  var range =[],domain=[0],cuml=50;

  domain.push(50)

  range.push({})

  data.forEach(function (parent) {

    cuml+= parent.elements.length*50

    domain.push(cuml)

    range.push(parent)

    cuml+=50

    range.push({})

    domain.push(cuml)

  })

  this.strip.subjects.domain(domain).range(range)

  this.strip.update(data)

}

function Strip(parent) {

  var bars = this.bars = d3.scale.quantile()
    .domain([0])
    .range([])

  var subjects = this.subjects = d3.scale.quantile()
    .domain([0])
    .range([])

  var drag = d3.behavior.drag()
  .on('drag',function (d) {
    var transform = this.__transform__,
    newX= transform.translate().x + d3.event.dx,
    right_limit = this.getBBox().width-125;

    if (-right_limit <= newX && newX <= 125 ){
      transform.translate.incr({x: d3.event.dx}).animate()

      $(this).trigger('tune',125-newX)
    }
  })

  if (parent) {

    Control.apply(this,[parent.element.append('g').attr('class','strip')])

    this.element.call(drag);

    this.background = this.element.insert('rect')
      .attr({
        height: 500,
        width: 50,
        fill: 'white'
      })

  }

}


Strip.prototype.width = function () {
  return this.background.attr('width')
}


Strip.prototype.fill = function (fill) {
  this.background.attr('fill',fill)
}

Strip.prototype.update = function (data) {

  var parent =this.element.node();

  var graphs = d3.select(parent).selectAll('g.graph').data(data);

  var bars = this.bars;
  var subjects = this.subjects
  var last = 50;


  graphs.enter()
  .append('g')
  .attr('class','graph')
  .each(function (d,i) {

    var graph = new Graph(d3.select(this));
    graph.update(d)

    var grade = new Grade(graph.element)

    grade.grade(d.score)

    grade.transform.translate.incr({x:d.elements.length*25}).render()

    graph.transform
      .translate({x:last ,y:'50'})
      .render()

    var domain = bars.domain(),
        range  = bars.range();

    range.push({})

    d.elements.forEach(function (v,i) {

      domain.push(last)

      range.push(v)

      last +=50

    })

    domain.push(last)

    range.push({})

    last += 50

    domain.push(last)

    bars.range(range).domain(domain)



  },parent.tuner)

  this.background.attr('width',last)

}

function Graph(parent) {
  if (parent) {

    Control.call(this,parent)

    this.background = this.element.append('rect')
      .attr({
        height: 350,
        width: 0,
        fill: 'floralwhite'
      })

  }
}

Graph.prototype.height = function () {
  return this.background.attr('height')
}

Graph.prototype.update = function (data) {

  //data must contains elements, elements must have scores

  var parent = this.element.node(),
      bars = d3.select(parent).selectAll('rect.bar').data(data.elements),
      h = this.height()

  bars.enter()
    .append('rect')
    .attr({
      'class':'bar',
      'height': function (d,i) {
        return d.score * h
      },
      width:50,
      x: function (d,i) {
        return i*50
      },
      y: function (d,i) {
        return h-(h * d.score)
      },
      fill: function (d,i) {
        return color_quantile(d.score)
      },
      'stroke':'black'

    })

  this.background.attr('width',data.elements.length*50)

}

function Viewfinder(parent) {
  if (parent) {
    this.icon = new Icon(parent).fa_type('crosshairs')
    this.transform = this.icon.transform;
  }
}

Viewfinder.prototype.position = function (pos){
  this.icon.transform
  .translate({x:pos.x,y:pos.y})
  .animate({ease:'poly'})
}

//font awesome dictionary object
var fa_ucode = {
  glass: "f000",
  music: "f001",
  search: "f002",
  'envelope-o': "f003",
  heart: "f004",
  star: "f005",
  'star-o': "f006",
  user: "f007",
  film: "f008",
  'th-large': "f009",
  th: "f00a",
  'th-list': "f00b",
  check: "f00c",
  times: "f00d",
  'search-plus': "f00e",
  'search-minus': "f010",
  'power-off': "f011",
  signal: "f012",
  cog: "f013",
  'trash-o': "f014",
  home: "f015",
  'file-o': "f016",
  'clock-o': "f017",
  road: "f018",
  download: "f019",
  'arrow-circle-o-down': "f01a",
  'arrow-circle-o-up': "f01b",
  inbox: "f01c",
  'play-circle-o': "f01d",
  repeat: "f01e",
  refresh: "f021",
  'list-alt': "f022",
  lock: "f023",
  flag: "f024",
  headphones: "f025",
  'volume-off': "f026",
  'volume-down': "f027",
  'volume-up': "f028",
  qrcode: "f029",
  barcode: "f02a",
  tag: "f02b",
  tags: "f02c",
  book: "f02d",
  bookmark: "f02e",
  print: "f02f",
  camera: "f030",
  font: "f031",
  bold: "f032",
  italic: "f033",
  'text-height': "f034",
  'text-width': "f035",
  'align-left': "f036",
  'align-center': "f037",
  'align-right': "f038",
  'align-justify': "f039",
  list: "f03a",
  outdent: "f03b",
  indent: "f03c",
  'video-camera': "f03d",
  'picture-o': "f03e",
  pencil: "f040",
  'map-marker': "f041",
  adjust: "f042",
  tint: "f043",
  'pencil-square-o': "f044",
  'share-square-o': "f045",
  'check-square-o': "f046",
  arrows: "f047",
  'step-backward': "f048",
  'fast-backward': "f049",
  backward: "f04a",
  play: "f04b",
  pause: "f04c",
  'stop': "f04d",
  forward: "f04e",
  'fast-forward': "f050",
  'step-forward': "f051",
  eject: "f052",
  'chevron-left': "f053",
  'chevron-right': "f054",
  'plus-circle': "f055",
  'minus-circle': "f056",
  'times-circle': "f057",
  'check-circle': "f058",
  'question-circle': "f059",
  'info-circle': "f05a",
  crosshairs: "f05b",
  'times-circle-o': "f05c",
  'check-circle-o': "f05d",
  ban: "f05e",
  'arrow-left': "f060",
  'arrow-right': "f061",
  'arrow-up': "f062",
  'arrow-down': "f063",
  share: "f064",
  expand: "f065",
  compress: "f066",
  plus: "f067",
  minus: "f068",
  asterisk: "f069",
  'exclamation-circle': "f06a",
  gift: "f06b",
  leaf: "f06c",
  fire: "f06d",
  eye: "f06e",
  'eye-slash': "f070",
  'exclamation-triangle': "f071",
  plane: "f072",
  calendar: "f073",
  random: "f074",
  comment: "f075",
  magnet: "f076",
  'chevron-up': "f077",
  'chevron-down': "f078",
  retweet: "f079",
  'shopping-cart': "f07a",
  folder: "f07b",
  'folder-open': "f07c",
  'arrows-v': "f07d",
  'arrows-h': "f07e",
  'bar-chart-o': "f080",
  'twitter-square': "f081",
  'facebook-square': "f082",
  'camera-retro': "f083",
  key: "f084",
  cogs: "f085",
  comments: "f086",
  'thumbs-o-up': "f087",
  'thumbs-o-down': "f088",
  'star-half': "f089",
  'heart-o': "f08a",
  'sign-out': "f08b",
  'linkedin-square': "f08c",
  'thumb-tack': "f08d",
  'external-link': "f08e",
  'sign-in': "f090",
  trophy: "f091",
  'github-square': "f092",
  upload: "f093",
  'lemon-o': "f094",
  phone: "f095",
  'square-o': "f096",
  'bookmark-o': "f097",
  'phone-square': "f098",
  twitter: "f099",
  facebook: "f09a",
  github: "f09b",
  unlock: "f09c",
  'credit-card': "f09d",
  rss: "f09e",
  'hdd-o': "f0a0",
  bullhorn: "f0a1",
  bell: "f0f3",
  certificate: "f0a3",
  'hand-o-right': "f0a4",
  'hand-o-left': "f0a5",
  'hand-o-up': "f0a6",
  'hand-o-down': "f0a7",
  'arrow-circle-left': "f0a8",
  'arrow-circle-right': "f0a9",
  'arrow-circle-up': "f0aa",
  'arrow-circle-down': "f0ab",
  globe: "f0ac",
  wrench: "f0ad",
  tasks: "f0ae",
  filter: "f0b0",
  briefcase: "f0b1",
  'arrows-alt': "f0b2",
  users: "f0c0",
  link: "f0c1",
  cloud: "f0c2",
  flask: "f0c3",
  scissors: "f0c4",
  'files-o': "f0c5",
  paperclip: "f0c6",
  'floppy-o': "f0c7",
  square: "f0c8",
  bars: "f0c9",
  'list-ul': "f0ca",
  'list-ol': "f0cb",
  strikethrough: "f0cc",
  underline: "f0cd",
  table: "f0ce",
  magic: "f0d0",
  truck: "f0d1",
  pinterest: "f0d2",
  'pinterest-square': "f0d3",
  'google-plus-square': "f0d4",
  'google-plus': "f0d5",
  money: "f0d6",
  'caret-down': "f0d7",
  'caret-up': "f0d8",
  'caret-left': "f0d9",
  'caret-right': "f0da",
  columns: "f0db",
  sort: "f0dc",
  'sort-asc': "f0dd",
  'sort-desc': "f0de",
  envelope: "f0e0",
  linkedin: "f0e1",
  undo: "f0e2",
  gavel: "f0e3",
  tachometer: "f0e4",
  'comment-o': "f0e5",
  'comments-o': "f0e6",
  bolt: "f0e7",
  sitemap: "f0e8",
  umbrella: "f0e9",
  clipboard: "f0ea",
  'lightbulb-o': "f0eb",
  exchange: "f0ec",
  'cloud-download': "f0ed",
  'cloud-upload': "f0ee",
  'user-md': "f0f0",
  stethoscope: "f0f1",
  suitcase: "f0f2",
  'bell-o': "f0a2",
  coffee: "f0f4",
  cutlery: "f0f5",
  'file-text-o': "f0f6",
  'building-o': "f0f7",
  'hospital-o': "f0f8",
  ambulance: "f0f9",
  medkit: "f0fa",
  'fighter-jet': "f0fb",
  beer: "f0fc",
  'h-square': "f0fd",
  'plus-square': "f0fe",
  'angle-double-left': "f100",
  'angle-double-right': "f101",
  'angle-double-up': "f102",
  'angle-double-down': "f103",
  'angle-left': "f104",
  'angle-right': "f105",
  'angle-up': "f106",
  'angle-down': "f107",
  desktop: "f108",
  laptop: "f109",
  tablet: "f10a",
  mobile: "f10b",
  'circle-o': "f10c",
  'quote-left': "f10d",
  'quote-right': "f10e",
  spinner: "f110",
  circle: "f111",
  reply: "f112",
  'github-alt': "f113",
  'folder-o': "f114",
  'folder-open-o': "f115",
  'smile-o': "f118",
  'frown-o': "f119",
  'meh-o': "f11a",
  gamepad: "f11b",
  'keyboard-o': "f11c",
  'flag-o': "f11d",
  'flag-checkered': "f11e",
  terminal: "f120",
  code: "f121",
  'reply-all': "f122",
  'mail-reply-all': "f122",
  'star-half-o': "f123",
  'location-arrow': "f124",
  crop: "f125",
  'code-fork': "f126",
  'chain-broken': "f127",
  question: "f128",
  info: "f129",
  exclamation: "f12a",
  superscript: "f12b",
  subscript: "f12c",
  eraser: "f12d",
  'puzzle-piece': "f12e",
  microphone: "f130",
  'microphone-slash': "f131",
  shield: "f132",
  'calendar-o': "f133",
  'fire-extinguisher': "f134",
  rocket: "f135",
  maxcdn: "f136",
  'chevron-circle-left': "f137",
  'chevron-circle-right': "f138",
  'chevron-circle-up': "f139",
  'chevron-circle-down': "f13a",
  html5: "f13b",
  css3: "f13c",
  anchor: "f13d",
  'unlock-alt': "f13e",
  bullseye: "f140",
  'ellipsis-h': "f141",
  'ellipsis-v': "f142",
  'rss-square': "f143",
  'play-circle': "f144",
  ticket: "f145",
  'minus-square': "f146",
  'minus-square-o': "f147",
  'level-up': "f148",
  'level-down': "f149",
  'check-square': "f14a",
  'pencil-square': "f14b",
  'external-link-square': "f14c",
  'share-square': "f14d",
  'compass': "f14e",
  'caret-square-o-down': "f150",
  'caret-square-o-up': "f151",
  'caret-square-o-right': "f152",
  eur: "f153",
  gbp: "f154",
  usd: "f155",
  inr: "f156",
  jpy: "f157",
  rub: "f158",
  krw: "f159",
  btc: "f15a",
  file: "f15b",
  'file-text': "f15c",
  'sort-alpha-asc': "f15d",
  'sort-alpha-desc': "f15e",
  'sort-amount-asc': "f160",
  'sort-amount-desc': "f161",
  'sort-numeric-asc': "f162",
  'sort-numeric-desc': "f163",
  'thumbs-up': "f164",
  'thumbs-down': "f165",
  'youtube-square': "f166",
  youtube: "f167",
  xing: "f168",
  'xing-square': "f169",
  'youtube-play': "f16a",
  dropbox: "f16b",
  'stack-overflow': "f16c",
  instagram: "f16d",
  flickr: "f16e",
  adn: "f170",
  bitbucket: "f171",
  'bitbucket-square': "f172",
  tumblr: "f173",
  'tumblr-square': "f174",
  'long-arrow-down': "f175",
  'long-arrow-up': "f176",
  'long-arrow-left': "f177",
  'long-arrow-right': "f178",
  apple: "f179",
  windows: "f17a",
  android: "f17b",
  linux: "f17c",
  dribbble: "f17d",
  skype: "f17e",
  foursquare: "f180",
  trello: "f181",
  female: "f182",
  male: "f183",
  gittip: "f184",
  'sun-o': "f185",
  'moon-o': "f186",
  archive: "f187",
  bug: "f188",
  vk: "f189",
  weibo: "f18a",
  renren: "f18b",
  pagelines: "f18c",
  'stack-exchange': "f18d",
  'arrow-circle-o-right': "f18e",
  'arrow-circle-o-left': "f190",
  'caret-square-o-left': "f191",
  'dot-circle-o': "f192",
  wheelchair: "f193",
  'vimeo-square': "f194",
  'try': "f195",
  'plus-square-o': "f196"
}
