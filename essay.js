// Flows an essay's text onto letter-size pages, the way Google Docs does,
// and numbers each page in the header (1, 2, 3, ...).
// The essay text lives in <article id="source">.
//
// Footnotes: the source lists them as numbered endnotes (<p class="note" id="fn1">)
// after a Notes heading, which is what shows without JavaScript. Here each note is
// instead set at the foot of the page that cites it, under a short rule, and the
// Notes page is dropped. A page keeps back as much room for its notes as it needs.
(function () {
  document.documentElement.classList.add("js");

  var PAGE_W = 816;
  var NOTE_GAP = 10; // px of air between the last line of text and the rule above the notes

  function paginate() {
    var source = document.getElementById("source");
    var doc = document.getElementById("doc");
    var frame = document.getElementById("frame");
    var pages = document.getElementById("pages");
    if (!source || !frame || !pages) return;

    var count = 0;
    var body = null;
    var notesEl = null;
    var pageNotes = []; // ids of the notes already set at the foot of the current page
    var fullH = 0;      // height of a page's text area with no notes
    var ruleH = 0;      // height of the rule above the notes
    var noteH = {};     // measured height of each note

    var notesById = {};
    Array.prototype.forEach.call(source.querySelectorAll(".note[id]"), function (n) {
      notesById[n.id] = n;
    });
    var hasNotes = Object.keys(notesById).length > 0;

    pages.textContent = "";
    pages.style.transform = "none";

    function newPage() {
      count += 1;
      var page = document.createElement("div");
      page.className = "page";
      var header = document.createElement("div");
      header.className = "page-header";
      header.textContent = String(count);
      body = document.createElement("div");
      body.className = "page-body essay";
      notesEl = document.createElement("div");
      notesEl.className = "page-notes essay";
      pageNotes = [];
      page.appendChild(header);
      page.appendChild(body);
      page.appendChild(notesEl);
      pages.appendChild(page);
    }

    // Height of the text area still available, once the notes in `extra` are added to this page's.
    function avail(extra) {
      var ids = pageNotes.concat(extra || []);
      var h = fullH;
      if (ids.length) {
        h -= ruleH + NOTE_GAP;
        ids.forEach(function (id) { h -= noteH[id] || 0; });
      }
      return h;
    }

    function addNotes(ids) {
      var added = false;
      ids.forEach(function (id) {
        if (notesById[id] && pageNotes.indexOf(id) < 0) { pageNotes.push(id); added = true; }
      });
      if (!added) return;
      notesEl.textContent = "";
      var rule = document.createElement("div");
      rule.className = "note-rule";
      notesEl.appendChild(rule);
      pageNotes.forEach(function (id) { notesEl.appendChild(notesById[id].cloneNode(true)); });
    }

    function measureNotes() {
      var m = document.createElement("div");
      m.className = "page-notes essay";
      m.style.cssText = "visibility:hidden;top:0;bottom:auto;left:0;right:auto;width:" + body.clientWidth + "px;";
      pages.appendChild(m);
      var rule = document.createElement("div");
      rule.className = "note-rule";
      m.appendChild(rule);
      ruleH = m.offsetHeight;
      Object.keys(notesById).forEach(function (id) {
        m.textContent = "";
        m.appendChild(notesById[id].cloneNode(true));
        noteH[id] = m.offsetHeight;
      });
      pages.removeChild(m);
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

    // The note a word points to, when the word is a footnote number.
    function refOf(w) {
      var a = w.closest("sup a");
      var href = a && a.getAttribute("href");
      return href && href.charAt(0) === "#" ? href.slice(1) : null;
    }

    function place(block, isRetry) {
      body.appendChild(block);
      var top = body.getBoundingClientRect().top;
      var onlyBlock = body.childNodes.length === 1;

      // Headings and short lines move to the next page whole. A section heading also
      // never sits alone at the bottom of a page.
      if (block.tagName !== "P" || block.classList.contains("heading-line")) {
        var need = block.getBoundingClientRect().bottom - top;
        if (block.classList.contains("section-heading")) need += lineHeight();
        if (onlyBlock || need <= avail() + 1) return;
        body.removeChild(block);
        if (isRetry) { body.appendChild(block); return; }
        newPage();
        place(block, true);
        return;
      }

      // Paragraphs split mid-paragraph at the last line that fits. Every footnote cited
      // above the cut takes room at the foot of the page, so that is counted as we go.
      if (!block.querySelector(".w")) wrapWords(block);
      var words = Array.prototype.slice.call(block.querySelectorAll(".w"));
      var refs = [];
      var best = 0;
      var bestRefs = [];
      for (var c = 1; c <= words.length; c++) {
        var r = refOf(words[c - 1]);
        if (r) refs.push(r);
        var bottom = words[c - 1].getBoundingClientRect().bottom - top;
        if (bottom > avail(refs) + 0.5) break;
        // A footnote number stays with the word before it, so never cut just before one.
        if (c === words.length || !words[c].closest("sup")) {
          best = c;
          bestRefs = refs.slice();
        }
      }

      if (best === words.length) { addNotes(bestRefs); return; }

      if (best === 0) {
        if (!isRetry && !onlyBlock) {
          body.removeChild(block);
          newPage();
          place(block, true);
          return;
        }
        best = words.length;
        bestRefs = words.map(refOf).filter(Boolean);
        addNotes(bestRefs);
        return;
      }

      var range = document.createRange();
      range.setStartBefore(words[best]);
      range.setEndAfter(block.lastChild);
      var rest = block.cloneNode(false);
      rest.removeAttribute("id");
      rest.classList.add("cont");
      rest.appendChild(range.extractContents());
      addNotes(bestRefs);
      newPage();
      place(rest, false);
    }

    newPage();
    fullH = body.clientHeight;
    if (hasNotes) measureNotes();

    Array.prototype.forEach.call(source.children, function (child) {
      // With notes at the foot of each page, the endnotes list is not flowed.
      if (hasNotes && (child.classList.contains("notes-title") || child.classList.contains("note"))) return;
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
