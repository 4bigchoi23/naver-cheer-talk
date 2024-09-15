// ==UserScript==
// @name         네이버 응원톡
// @namespace    https://github.com/4bigchoi23
// @version      1.3.0
// @description  응원톡 특정 유저 차단
// @author       Big+ (4bigchoi23@gmail.com)
// @match        https://m.sports.naver.com/game/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=naver.com
// @require      https://code.jquery.com/jquery.min.js
// @grant        none
// ==/UserScript==

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
        del(value, index, reverse) {
            let arr = this.get(this.key);
            arr = arr.filter(e => e !== value);
            if (index !== undefined) {
                if (!reverse) {
                    arr = arr.filter(e => !(e.indexOf(value) === index));
                } else {
                    arr = arr.filter(e => !((e.split('').reverse().join('')).indexOf(value.split('').reverse().join('')) === index));
                }
            }
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
            switch (this.key) {
                case 'BlockUsers':
                    let arr = this.get(this.key);
                    let tmp = arr.map(e => `._user_id_no_${e} .u_cbox_text_wrap`).join(',').concat(arr.length ? ',' : ''); // .u_cbox_text_wrap
                    let str = `<style id="BlockUsers">${tmp}._user_id_no_{display:none}.u_cbox_name,.u_cbox_date{cursor:pointer}</style>`;
                    $('#BlockUsers').remove();
                    $('head').append($(str));
                    break;
                case 'UsersCheer':
                    break;
            }
            return;
        }
    }

    const storageKey = 'BlockUsers';
    const storageObj = new LocalStorage(storageKey);
    storageObj.cat();

    const fanaticKey = 'UsersCheer';
    const fanaticObj = new LocalStorage(fanaticKey);
    fanaticObj.cat();

    const leagues = {
        kbo: {
            teams: ['HT', 'WO', 'SK', 'LT', 'OB', 'KT', 'NC', 'SS', 'HH', 'LG'],
            default: `https://ssl.pstatic.net/static/sports/2021/m/12/07/no_emblem_baseball.png`,
            emblem: `https://sports-phinf.pstatic.net/team/kbo/default/[].png?type=f108_108`,
        },
        kleague: {
            teams: ['01', '03', '04', '05', '09', '10', '17', '18', '21', '22', '29', '35'],
            default: `https://ssl.pstatic.net/static/sports/2021/m/12/07/no_emblem_football.png`,
            emblem: `https://sports-phinf.pstatic.net/team/kleague/default/[].png?type=f108_108`,
        },
        kbl: {
            teams: ['70', '50', '55', '10', '60', '16', '06', '64', '35', '66'],
            default: `https://ssl.pstatic.net/static/sports/2021/m/12/07/no_emblem_basketball.png`,
            emblem: `https://sports-phinf.pstatic.net/team/kbl/default/[].png?type=f108_108`,
        },
    };

    $(document).on('click', '.u_cbox_name', function() {
        const $this = $(this);
        const $wrap = $this.closest('.u_cbox_comment');
        const _user = $wrap.attr('class').replace(/.*_user_id_no_([A-Za-z0-9]+).*/g, '$1');
        const _nick = $this.text();

        // console.log(_user, _nick);
        if (_user) {
            storageObj.tog(_user);
            storageObj.cat();
        }
    });

    $(document).on('click', '.u_cbox_date', function() {
        const $this = $(this);
        const $wrap = $this.closest('.u_cbox_comment');
        const _info = $wrap.data('info') || '';
        const _user = $wrap.attr('class').replace(/.*_user_id_no_([A-Za-z0-9]+).*/g, '$1');
        const _nick = $wrap.find('.u_cbox_nick').text();
        const $icon = $wrap.find('.u_cbox_img_contents');
        const _icon = $icon.attr('src') || '';

        const schedule = $('[aria-describedby="wa_tooltip_message_schedule"]').attr('href').trim();
        const section = schedule?.split('/')?.[1];
        const category = schedule?.replace(/.*\?category=([a-z]+)(&.*)?/, '$1');

        $wrap.data('user', _user);
        $wrap.data('nick', _nick);
        $wrap.data('icon', _icon);

        if (_info) {
            const objectId = _info.replace(/.*objectId\:'([A-Z0-9]+)'.*/, '$1');
            const commentNo = _info.replace(/.*commentNo\:'([0-9]+)'.*/, '$1');
            // console.log(objectId, commentNo);
            if ($this.siblings('.u_cbox_work_main').length === 0 && $wrap.find('.u_cbox_delete_contents').length === 0) { 
                $this.after($(`<a style="margin-left: 0.5em;" class="u_cbox_btn_report" data-action="report#openLayer" data-param="objectId:'${objectId}',commentNo:'${commentNo}'" data-log="RPC.fold"><span class="u_cbox_ico_bar"></span><span class="u_cbox_ico_report"></span><span class="u_cbox_in_report">💩 신고</span></a>`));
            }
            $this.after($(`<span style="float: left; letter-spacing: 0; font-family: monospace; line-height: 1; color: var(--color-comment-info-base);">${_user}</span>`));
            $this.remove();
        }

        let image;
        const regex = new RegExp(`${_user}\\|${category}\\|[A-Za-z0-9]+$`);
        const match = fanaticObj.get().filter(e => e.match(regex))?.[0]?.split('|')?.[2];
        if (match) {
            image = leagues[category]?.emblem?.replace('[]', match);
            if (image) {
                // console.log(_user, match, image);
                $icon.attr('src', image);
                $wrap.find('.u_cbox_nick').css('color', 'var(--color-comment-point2)');
            }
        }
    });

    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.oldValue !== mutation.target.textContent) {
                if (mutation?.addedNodes[0]?.id?.match(/^callback_sportsNoLimitLikeCallBack[\d]+$/)) {
                    const callback = mutation?.addedNodes[0]?.id?.replace('callback_', '');
                }
                if (mutation.target.className === 'u_cbox') {
                    if ($('.u_cbox_comment .u_cbox_pic').length) {
                        $('.u_cbox_wrap').addClass('u_cbox_type_select');
                    }
                }
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

    let tid;
    $(document).on('click', '.CheerVS_emblem__2zXNQ', function() {
        const $this = $(this);
        const $next = $this.next();
        if (tid) {
            clearInterval(tid);
        }
        if ($('.u_cbox_type_logged_in').length) {
            let msg = "";
            msg += "해당 팀의 자동 응원을 시작하시겠습니까? ";
            msg += "\n";
            msg += "\n[확인] 버튼을 누르시면 ";
            msg += "\n1인당 최대 응원수까지 자동으로 클릭합니다. (1초당 8회) ";
            msg += "\n";
            msg += "\n1인당 최대 응원수 도달 시 [경고창]이 지속되면 ";
            msg += "\n[F5] 키를 눌러 페이지를 [새로고침] 하세요!";
            if (confirm(msg)) {
                console.log(new Date());
                console.log($next.text().replace(/([^\d,]+)([\d,]+)$/g, '$1 $2'));
                tid = setInterval(function() {
                    $next.trigger('click');
                }, 125);
            }
        }
    });
    $(window).on('siren', function() {
        if (tid) {
            clearInterval(tid);
        }
    });
    $(document).on('click', '.GameList_list_item__1xUE2', function() {
        $(window).trigger('siren');
    });
    $(document).on('focus', '#cbox_module__write_textarea', function() {
        $(window).trigger('siren');
    });

    $(document).ready(function() {
        const schedule = $('[aria-describedby="wa_tooltip_message_schedule"]').attr('href').trim();
        const section = schedule?.split('/')?.[1];
        const category = schedule?.replace(/.*\?category=([a-z]+)(&.*)?/, '$1');
        console.log(section, category);

        const layer = (e) => {
            return `
                <style>
                    .u_cbox_pic {
                        cursor: pointer;
                    }
                    #teams-layer {
                        display: none;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 99999;
                        width: 215px;
                        padding: 15px;
                        background-color: #274281;
                        color: #fff;
                        border: 0;
                        border-radius: 10px;
                        box-shadow: 0 0 30px rgba(0,0,0,0.5);
                    }
                    #teams-layer div:first-child {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    #teams-layer div:last-child {
                        display: flex;
                        gap: 5px;
                        flex-wrap: wrap;
                        justify-content: start;
                        align-items: center;
                    }
                    #teams-layer > div + div {
                        margin-top: 10px;
                    }
                    #teams-layer img {
                        width: 50px;
                        height: 50px;
                        vertical-align: middle;
                        cursor: pointer;
                    }
                    #teams-layer img[alt=""] {
                        margin-left: auto;
                    }
                    #teams-layer .close {
                        background-color: transparent;
                        color: inherit;
                        border: 0;
                        border-radius: 0;
                    }
                    #teams-layer hr {
                        display: block;
                        margin: 10px 0;
                        border: 0;
                        border-top: 1px solid rgba(255,255,255,0.125);
                    }
                </style>
                <div id="teams-layer" data-user="" data-nick="" data-icon="">
                    <div>
                        <span data-nick="닉네임">닉네임</span>
                        <button type="button" class="close">닫기</button>
                    </div>
                    <hr />
                    <div>
                        ${e}
                    </div>
                </div>
            `;
        };

        const teams = [];
        $.each(leagues, (i, j) => {
            let str = ``;
            $.each(j.teams, (o, p) => {
                let src = j.emblem.replace('[]', p);
                str += `<img src="${src}" alt="${p}" /> `
            });
            str += `<img src="${j.default}" alt="" />`;
            str = `<div>${str}</div>`;
            teams[i] = layer(str);
        });

        if (teams[category]) {
            $('body').append($(teams[category]));
        }

        $(document).on('click', '.u_cbox_pic', function() {
            const $this = $(this);
            const $team = $('#teams-layer');
            const $wrap = $this.closest('.u_cbox_comment');
            const _user = $wrap.data('user');
            const _nick = $wrap.data('nick');
            const _icon = $wrap.data('icon');
            // console.log(_user, _nick, _icon);
            $team.data('user', _user);
            $team.data('nick', _nick);
            $team.data('icon', _icon);
            $team.find('[data-nick]').text(_nick);
            $team.show();
        });
        $(document).on('click', '#teams-layer .close', function() {
            const $this = $(this);
            const $team = $('#teams-layer');
            $team.hide();
            $team.data('user', '');
            $team.data('nick', '');
            $team.data('icon', '');
            $team.find('[data-nick]').text(function() {
                return $(this).data('nick');
            });
        });
        $(document).on('click', '#teams-layer img[alt]', function() {
            const $this = $(this);
            const $team = $('#teams-layer');
            const _team = $this.attr('alt');
            const _user = $team.data('user');
            const _nick = $team.data('nick');
            const _icon = $team.data('icon');
            const $that = $(`.u_cbox_comment._user_id_no_${_user} .u_cbox_img_contents`);
            // console.log(_team || '[]', _user, _nick, _icon);
            if (_user && _icon) {
                $that.attr('src', _team ? $this.attr('src') : _icon);
                $that.closest('.u_cbox_comment').find('.u_cbox_nick').css('color', _team ? 'var(--color-comment-point2)' : '');
                fanaticObj.del(`${_user}|${category}|`, 0);
                if (_team) {
                    fanaticObj.set(`${_user}|${category}|${_team}`);
                }
            }
            $team.find('.close').trigger('click');
        });
    });
})(window.jQuery.noConflict(true));