// Flows an essay's text onto letter-size pages, the way Google Docs does,
// and numbers each page in the header ("Shimamoto 1", "Shimamoto 2", ...).
// The essay text lives in <article id="source" data-surname="...">.
(function () {
  document.documentElement.classList.add("js");

  var PAGE_W = 816;

  function paginate() {
    var source = document.getElementById("source");
    var doc = document.getElementById("doc");
    var frame = document.getElementById("frame");
    var pages = document.getElementById("pages");
    if (!source || !frame || !pages) return;

    var surname = source.getAttribute("data-surname") || "";
    var count = 0;
    var body = null;

    pages.textContent = "";
    pages.style.transform = "none";

    function newPage() {
      count += 1;
      var page = document.createElement("div");
      page.className = "page";
      var header = document.createElement("div");
      header.className = "page-header";
      header.textContent = surname + " " + count;
      body = document.createElement("div");
      body.className = "page-body essay";
      page.appendChild(header);
      page.appendChild(body);
      pages.appendChild(page);
    }

    function overflows() {
      return body.scrollHeight > body.clientHeight + 1;
    }

    function wrapWords(el) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var texts = [];
      while (walker.nextNode()) texts.push(walker.currentNode);
      texts.forEach(function (t) {
        var frag = document.createDocumentFragment();
        t.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            var span = document.createElement("span");
            span.className = "w";
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        t.parentNode.replaceChild(frag, t);
      });
    }

    function lineHeight() {
      return parseFloat(getComputedStyle(body).lineHeight) || 36.8;
    }

    function place(block, isRetry) {
      body.appendChild(block);

      // A section heading never sits alone at the bottom of a page.
      if (block.classList.contains("section-heading") && body.childNodes.length > 1 &&
          block.getBoundingClientRect().bottom - body.getBoundingClientRect().top + lineHeight() > body.clientHeight + 1) {
        body.removeChild(block);
        newPage();
        body.appendChild(block);
        return;
      }

      if (!overflows()) return;

      // Headings and short lines move to the next page whole.
      if (block.tagName !== "P" || block.classList.contains("heading-line")) {
        body.removeChild(block);
        if (isRetry) { body.appendChild(block); return; }
        newPage();
        place(block, true);
        return;
      }

      // Paragraphs split mid-paragraph at the last line that fits.
      if (!block.querySelector(".w")) wrapWords(block);
      var limit = body.getBoundingClientRect().bottom + 0.5;
      var words = block.querySelectorAll(".w");
      var cut = null;
      for (var i = 0; i < words.length; i++) {
        if (words[i].getBoundingClientRect().bottom > limit) { cut = words[i]; break; }
      }
      if (!cut) return;
      if (cut === words[0]) {
        body.removeChild(block);
        if (isRetry) { body.appendChild(block); return; }
        newPage();
        place(block, true);
        return;
      }
      var range = document.createRange();
      range.setStartBefore(cut);
      range.setEndAfter(block.lastChild);
      var rest = block.cloneNode(false);
      rest.removeAttribute("id");
      rest.classList.add("cont");
      rest.appendChild(range.extractContents());
      newPage();
      place(rest, false);
    }

    newPage();
    Array.prototype.forEach.call(source.children, function (child) {
      var block = child.cloneNode(true);
      if (child.hasAttribute("data-page-break") && body.childNodes.length) newPage();
      place(block, false);
    });

    // The pages now hold the live copy, so footnote links must point there, not at the hidden source.
    Array.prototype.forEach.call(source.querySelectorAll("[id]"), function (el) {
      el.removeAttribute("id");
    });

    function fit() {
      var cs = getComputedStyle(doc);
      var avail = doc.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var scale = Math.min(1, avail / PAGE_W);
      pages.style.transform = scale < 1 ? "scale(" + scale + ")" : "none";
      frame.style.width = PAGE_W * scale + "px";
      frame.style.height = pages.offsetHeight * scale + "px";
    }
    fit();
    window.addEventListener("resize", fit);
  }

  function start() {
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(paginate, paginate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
