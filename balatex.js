// requires: resigtmp.js, underscore.js
Function.prototype.method = function (name, func) { // crockford's "method" method
    this.prototype[name] = func;
        return this;
};
/* navigation bar methods */
var navNode = function(_parent, title, number, children) {
    this.title = title;
    this.number = number;
    this.children = children;
    return this;
};
navNode.getData = function(article, starting) { // static class to get data representation of this
    var title = article.title;
    var content = article.innerHTML;
    var nodeName = article.nodeName;
    var c = _.filter(article.childNodes, 
                     function(node) { return node.nodeName == "SECTION" });
    var children = [];
    if(typeof starting === 'undefined')
        starting = "1";
    var number = starting;
    // set id
    article.id = number
    for(var i = 0; i < c.length; i++) {
        starting = number + "." + (i + 1);
        children.push(navNode.getData(c[i], starting));
    }
    return { "title": title, 
             "id": number, 
             "number": number, 
             "content": content, 
             "nodeName": nodeName,
             "children": children}
};
navNode.wrapData = function(data) {
    return '<a href="#'+data.id+'">' + data.number + " - " + data.title + "</a>";
};
navNode.data2HTML = function(data, showTitle) {
    var current = navNode.wrapData(data),
        cData = data.children,
        open = "<ul><li>", 
        close = "</li></ul>"
        child = "";
    if (!showTitle) {
        open = "";
        close = "";
        current = "";
    }
    if (cData.length > 0) {
        for(var i = 0; i < cData.length; i++) {
            child += this.data2HTML(cData[i], true);
        }
    }
    return open + current + child + close;
};
navNode.method("getChildren", function() {
    return this.children;
});
navNode.method("getParent", function() {
    return this._parent;
});

/* helper functions */
var h = (function() {
    return {
        isHeader: function(domnode) {
            return h.inside(domnode.nodeName, ["H1", "H2", "H3", "H4", "H5", "H6"]);
        },
        prepend: function(paren, child) { /* append before first element */
            paren.insertBefore(child, paren.firstChild);
        },
        remove: function(element) { /* remove an element */
            element.parentNode.removeChild(element);
        },
        c: function(tag) { /* create element */
            return document.createElement(tag);
        },
        inside: function(item, list) {
            return _.indexOf(list,item) !== -1;
        }
    };
})();
var balatex = (function(){
    var HEADERTAG = "h1";
    var ROOT = "";
    var TEMPLATE = "tm";
    var scriptIncludes = [
                            {"src": ROOT + "underscore.js"}, {"src": ROOT + "resigtmp.js"},
                         ];
    var cssIncludes = [
                        {"href": ROOT + "balatex.css"}
                      ];
    var article = document.getElementsByTagName("article");
    var nav = document.getElementsByTagName("nav");
    var d = new Date();
    return {
        doMath: function(){
            console.info("Loading MathJax: Math Package");
            var config = document.createElement("script"),
                mathjax = document.createElement("script"),
                head = document.head;
            config.type = "text/x-mathjax-config";
            config.innerHTML = "MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});";
            mathjax.type = "text/javascript";
            mathjax.src = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
            head.appendChild(config);
            head.appendChild(mathjax);
        },
        parseFile: function(content) {
            var replace = { 
                            "`": "&lsquo;",
                            "``": "&ldquo;",
                            "''": "&rdquo;",
                            //"\"": "&rdquo;", // lol broken
                            "'": "&rsquo;",
//                            "--": "&ndash;",
                            "---": "&mdash;",
            }
            for(var key in replace) {
                content = content.replace(new RegExp(key, "g"), replace[key]);
            }
            return content;
        },
        setContent: function(content) {
          balatex.getContainer().innerHTML = content;
        },
        getContainer: function(){
          if(balatex.templateExists())
              return document.getElementById(TEMPLATE);   
          else
              return document.getElementsByTagName("body")[0];   
        },
        getContent: function() { 
          return balatex.getContainer().innerHTML;
        },
        templateExists: function() { 
            return document.getElementById(TEMPLATE) !== null;
        },
        insertIncludes: function() {
            var head = document.head,
                si = balatex.getScriptIncludes(),
                ci = balatex.getCssIncludes(),
                script,
                link;
            for(var i = 0; i < si.length; i++) {
              script = document.createElement("script");
              script.type = "text/javascript";
              script.src = si[i].src;
              h.prepend(head, script);
            }
            for(var i = 0; i < ci.length; i++) {
              link = document.createElement("link");
              link.href = ci[i].href;
              link.rel = "stylesheet";
              h.prepend(head, link);
            }
        },
        getScriptIncludes: function() {
            return scriptIncludes;
        },
        getCssIncludes: function () {
            return cssIncludes;
        },
        getNav: function() { return nav[0]; },
        getArticle: function() { return article[0]; },
        getMeta: function () {
            if(typeof _meta === 'undefined') {
                _meta = {}
            }
            _meta['date'] = d.toDateString();
            _meta['title'] = document.title || "A BaLaTeX Document"
            return _meta;
        },
        template: function(data) {
          document.body.innerHTML = tmpl(balatex.getContent(), data);
        },
        insertTitles: function(data) {
          var headerTag = document.createElement(HEADERTAG),
              section = document.getElementById(data.id);
          if(data.nodeName === "ARTICLE")
            section = document.getElementsByTagName("header")[0];
          if(balatex.getMeta().numbering)
              headerTag.innerHTML = data.number + " " + data.title;
          else
              headerTag.innerHTML = data.title;
          headerTag.setAttribute("name",data.number);
          if(data.children.length > 0)
              for(var i = 0; i < data.children.length; i++)
                  balatex.insertTitles(data.children[i])
          section.insertBefore(headerTag, section.firstChild);
        },
        insertNav: function(data, title) {
            if (typeof balatex.getNav() !== 'undefined') {
                var results = navNode.data2HTML(data, false);
                if (typeof title !== 'undefined')
                    results = "<h1>" + title + "</h1>" + results;
                balatex.getNav().innerHTML = results;
            }
        },
        makeBar: function() {
            var divBar = h.c("div"),
                aExportHTML = h.c("a");
            divBar.id = "balatex_bar";
            aExportHTML.innerHTML = "Export -> Compiled HTML";
            aExportHTML.href = "javascript:balatex.doExport('html');";
            divBar.appendChild(aExportHTML);
            h.prepend(document.body, divBar);
        },
        htmlExport: function(document) {
            var doctype = "<!DOCTYPE HTML>",
                result = "",
                html = document.getElementsByTagName("html")[0],
                cloneHtml = html.cloneNode(true),
                i;
            result = cloneHtml.innerHTML;
            return doctype + "<html>" + result + "</html>";
        },
        doExport: function(target) {
           var result = "";
           if (target.toLowerCase() === 'html') {
               result = balatex.htmlExport(document);
           }
           console.log(result);
           return result
        },
        main: function() {
            if (h.inside('math', balatex.getMeta().modules)) {
                balatex.doMath();
                if(typeof MathJax !== 'undefined') {
                    MathJax.Hub.Config({
                        tex2jax: {
                            inlineMath: [['$','$'], ['\\(','\\)']]
                        }
                    });
                    MathJax.Hub.Configured()
                }
            }
            balatex.setContent(balatex.parseFile(balatex.getContent()));
            /*
            if(balatex.templateExists()) {
                balatex.template(balatex.getMeta());
            }
            */
            var data = navNode.getData(balatex.getArticle(), "1");
            balatex.insertTitles(data)
            if(typeof balatex.getNav() !== 'undefined') {
                balatex.insertNav(data, balatex.getNav().title)
            }
//            balatex.makeBar();
        }
    };
})();

/* MAIN */

balatex.insertIncludes();
window.onload = function () {
    balatex.main();
};
