
var loadStylesheet = function(url, callback) {
  var head = document.getElementsByTagName('head')[0];
  var cssnode = document.createElement('link');
  cssnode.type = 'text/css';
  cssnode.rel = 'stylesheet';
  cssnode.href = url;
  cssnode.onreadystatechange = callback;
  cssnode.onload = callback;
  head.appendChild(cssnode);
}

var loadJavascriptFile = function(url){
  var script = document.createElement('script');
    script.type = 'text/javascript';

    script.src = url;
    document.body.appendChild(script);
}

loadStylesheet("https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.3/gh-fork-ribbon.min.css");
loadStylesheet("https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css");
loadStylesheet("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
loadStylesheet("https://pro.fontawesome.com/releases/v5.10.0/css/all.css");


loadJavascriptFile('https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js');
loadJavascriptFile('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js');
loadJavascriptFile('https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js');
loadJavascriptFile('https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js');
