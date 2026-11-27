/* Spam guard for FormSubmit forms.
   Layers: hidden endpoint (set only after checks pass), honeypot, minimum time on page,
   link limits, blocked words, gibberish check, one send per 30 s. FormSubmit's own
   reCAPTCHA and _blacklist run after this on their side. */
(function () {
  var MIN_MS = 4000;          // humans need more than 4 s to fill a form
  var MAX_LINKS = 1;          // at most one link in the whole message
  var COOLDOWN_MS = 30000;    // one send per 30 s per browser
  var BLOCKED = /\b(viagra|cialis|casino|betting|porn|xxx|escort|bitcoin|crypto ?(currency|investment)|forex|binary option|loan offer|payday loan|hack(ed)? account|telegram me|whatsapp me at|seo ranking guaranteed|first page of google guaranteed)\b/i;
  var LINK = /(https?:\/\/|www\.|\[url|<a\s)/gi;
  var loadedAt = Date.now();

  function decode(s) { try { return atob(s); } catch (e) { return ''; } }
  function say(form, msg) {
    var box = form.querySelector('.form-error');
    if (!box) {
      box = document.createElement('p');
      box.className = 'form-error';
      box.setAttribute('role', 'alert');
      var btn = form.querySelector('[type=submit]');
      form.insertBefore(box, btn);
    }
    box.textContent = msg;
  }
  function val(form, name) { var el = form.querySelector('[name="' + name + '"]'); return el ? (el.value || '').trim() : ''; }

  document.querySelectorAll('form[data-fs]').forEach(function (form) {
    var started = 0;
    form.addEventListener('focusin', function () { if (!started) started = Date.now(); });
    form.addEventListener('submit', function (ev) {
      var now = Date.now();
      var honey = val(form, '_honey');
      var name = val(form, 'name'), msg = val(form, 'message'), email = val(form, 'email');
      var all = [name, msg, val(form, 'phone'), val(form, 'website'), email].join(' ');
      var links = (msg.match(LINK) || []).length + (name.match(LINK) || []).length;
      var last = 0; try { last = +localStorage.getItem('fs_last') || 0; } catch (e) {}

      // Silent drops: bots should not learn why they failed.
      if (honey || now - loadedAt < MIN_MS || (started && now - started < 2500)) { ev.preventDefault(); form.reset(); say(form, 'Thanks! Your message has been sent.'); return; }

      // Visible messages for things a real person might trip over.
      if (name && /(https?:\/\/|www\.|\.com\b|\d{6,})/i.test(name)) { ev.preventDefault(); say(form, 'Please enter your name without links or numbers.'); return; }
      if (links > MAX_LINKS) { ev.preventDefault(); say(form, 'Please include no more than one link in your message.'); return; }
      if (BLOCKED.test(all)) { ev.preventDefault(); say(form, 'Your message looks like spam. Please email us directly if this is a genuine enquiry.'); return; }
      if (msg && msg.length > 30 && !/[aeiou]/i.test(msg.replace(/[^a-z]/gi, '')) ) { ev.preventDefault(); say(form, 'Please check your message and try again.'); return; }
      if (now - last < COOLDOWN_MS) { ev.preventDefault(); say(form, 'You have just sent a message. Please wait a moment before sending another.'); return; }

      // Passed: attach the real endpoint only now, so scrapers never see it in the HTML.
      form.action = decode(form.getAttribute('data-fs'));
      try { localStorage.setItem('fs_last', String(now)); } catch (e) {}
      var b = form.querySelector('[type=submit]'); if (b) { b.disabled = true; b.textContent = 'Sending…'; }
    });
  });
})();
