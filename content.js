(function ($, undefined) {
    window.alert = function(siren) {
        return function(msg) {
            siren(msg);
            $(window).trigger('siren');
        };
    }(window.alert);

    class LocalStorage {
        constructor(key) {
            this.key = key;
        }
        get() {
            let str = localStorage.getItem(this.key);
            let arr = str ? str.split("\n") : [];
            arr = arr.map(e => e.trim());
            arr = arr.filter(n => n);
            return arr;
        }
        set(value) {
            let arr = this.get(this.key);
            arr = arr.filter(e => e !== value);
            arr.push(value);
            localStorage.setItem(this.key, arr.join("\n"));
            return;
        }
        del(value) {
            let arr = this.get(this.key);
            arr = arr.filter(e => e !== value);
            localStorage.setItem(this.key, arr.join("\n"));
            return;
        }
        tog(value) {
            let arr = this.get(this.key);
            let put = arr.indexOf(value) === -1 ? true : false;
            arr = arr.filter(e => e !== value);
            if (put) arr.push(value);
            localStorage.setItem(this.key, arr.join("\n"));
            return;
        }
        cat() {
            let arr = this.get(this.key);
            let tmp = arr.map(e => `._user_id_no_${e} .u_cbox_text_wrap`).join(',').concat(arr.length ? ',' : ''); // .u_cbox_text_wrap
            let str = `<style id="BlockUsers">${tmp}._user_id_no_{display:none}.u_cbox_name,.u_cbox_date{cursor:pointer}</style>`;
            $('#BlockUsers').remove();
            $('head').append($(str));
            return;
        }
    }

    const storageKey = 'BlockUsers';
    const storageObj = new LocalStorage(storageKey);

    storageObj.cat();
    
    $(document).on('click', '.u_cbox_name', function() {
        var $this = $(this),
            $wrap = $this.closest('.u_cbox_comment'),
            _nick = $this.text(),
            _user = $wrap.attr('class').replace(/.*_user_id_no_([A-Za-z0-9]+).*/g, '$1');

        console.log(_nick, _user);
        if (_user) {
            storageObj.tog(_user);
            storageObj.cat();
        }
    });

    $(document).on('click', '.u_cbox_date', function() {
        var $this = $(this),
            $wrap = $this.closest('.u_cbox_comment'),
            _info = $wrap.data('info') || '',
            _user = $wrap.attr('class').replace(/.*_user_id_no_([A-Za-z0-9]+).*/g, '$1');

        if (_info) {
            var objectId = _info.replace(/.*objectId\:'([A-Z0-9]+)'.*/, '$1');
            var commentNo = _info.replace(/.*commentNo\:'([0-9]+)'.*/, '$1');
            // console.log(objectId, commentNo);
            if ($this.siblings('.u_cbox_work_main').length === 0 && $wrap.find('.u_cbox_delete_contents').length === 0) { 
                $this.after($(`<a style="margin-left: 0.5em;" class="u_cbox_btn_report" data-action="report#openLayer" data-param="objectId:'${objectId}',commentNo:'${commentNo}'" data-log="RPC.fold"><span class="u_cbox_ico_bar"></span><span class="u_cbox_ico_report"></span><span class="u_cbox_in_report">💩 신고</span></a>`));
            }
            $this.after($(`<span style="float: left; letter-spacing: 0; font-family: monospace; line-height: 1; color: var(--color-comment-info-base);">${_user}</span>`));
            $this.remove();
        }
    });

    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.oldValue !== mutation.target.textContent) {
                if (mutation.target.className === 'u_cbox_list' && mutation.removedNodes.length === 0) {
                    $('.u_cbox_date').trigger('click');
                }
            }
        });
    }).observe(document.body, {
        characterDataOldValue: true, 
        subtree: true, 
        childList: true, 
        characterData: true
    });

    var tid;
    $(document).on('click', '.CheerVS_emblem__2zXNQ', function() {
        var $this = $(this),
            $next = $this.next();
        if (tid) {
            clearInterval(tid);
        }
        if ($('.u_cbox_type_logged_in').length) {
            if (confirm("해당 팀의 자동 응원을 시작하시겠습니까? \n[확인] 버튼을 누르시면 \n1인당 최대 응원수까지 자동으로 클릭합니다. (1초당 8회)")) {
                console.clear();
                console.log(new Date());
                console.log($next.text().replace(/([^\d,]+)([\d,]+)$/g, '$1 $2'));
                tid = setInterval(function() {
                    $next.trigger('click');
                }, 125);
            }
        }
    });
    $(window).on("siren", function() {
        if (tid) {
            clearInterval(tid);
        }
    });
    $(document).on('click', '.GameList_list_item__1xUE2', function() {
        if (tid) {
            clearInterval(tid);
        }
    });
    $(document).on('focus', '#cbox_module__write_textarea', function() {
        if (tid) {
            clearInterval(tid);
        }
    });
})(window.jQuery.noConflict(true));