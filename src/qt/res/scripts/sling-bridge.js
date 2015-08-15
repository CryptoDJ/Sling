/* Overview Page */
var overviewPage = {
    init: function() {
        this.balance = $(".balance"),
        this.slingBal = $("#slingBal"),
        this.reserved = $("#reserved"),
        this.stake = $("#stake"),
        this.unconfirmed = $("#unconfirmed"),
        this.immature = $("#immature"),
        this.total = $("#total");

        // Announcement feed
        $.ajax({
            url:"",
            dataType: 'jsonp'
        }).success(function(rss) {
            rss.responseData.feed.entries = rss.responseData.feed.entries.sort(function(a,b){
                return new Date(b.publishedDate) - new Date(a.publishedDate);
            });
            for(i=0;i<rss.responseData.feed.entries.length;i++) {
                $('#announcements').append("<h4><a href='" + rss.responseData.feed.entries[i].link  + "'>" + rss.responseData.feed.entries[i].title + "</a></h4>"
                                         + "<span>"
                                             +      new Date(rss.responseData.feed.entries[i].publishedDate).toDateString()
                                         + "</span>");
            }
        });

        var menu = [{
                name: 'Backup&nbsp;Wallet...',
                fa: 'fa-save red fa-fw',
                fun: function () {
                   bridge.userAction(['backupWallet']);
                }
                }, /*
                {
                    name: 'Export...',
                    img: 'qrc:///icons/editcopy',
                    fun: function () {
                        copy('#addressbook .footable .selected .label');
                    }
                }, */
                {
                    name: 'Sign&nbsp;Message...',
                    fa: 'fa-pencil-square-o red fa-fw',
                    fun: function () {
                       bridge.userAction({'signMessage': $('#receive .footable .selected .address').text()});
                    }
                },
                {
                    name: 'Verify&nbsp;Message...',
                    fa: 'fa-check red fa-fw',
                    fun: function () {
                       bridge.userAction({'verifyMessage': $('#addressbook .footable .selected .address').text()});
                    }
                },
                {
                    name: 'Exit',
                    fa: 'fa-times red fa-fw',
                    fun: function () {
                       bridge.userAction(['close']);
                    }
                }];

        $('#file').contextMenu(menu, {onOpen:function(data,e){openContextMenu(data.menu);}, onClose:function(data,e){data.menu.isOpen = 0;}, triggerOn: 'click', displayAround: 'trigger', position: 'bottom', mouseClick: 'left', sizeStyle: 'content'});

        menu = [{
                     id: 'encryptWallet',
                     name: 'Encrypt&nbsp;Wallet...',
                     fa: 'fa-lock red fa-fw',
                     fun: function () {
                        bridge.userAction(['encryptWallet']);
                     }
                 },
                 {
                     id: 'changePassphrase',
                     name: 'Change&nbsp;Passphrase...',
                     fa: 'fa-key red fa-fw',
                     fun: function () {
                        bridge.userAction(['changePassphrase']);
                     }
                 },
                 {
                     id: 'toggleLock',
                     name: '(Un)Lock&nbsp;Wallet...',
                     fa: 'fa-unlock red pad fa-fw',
                     fun: function () {
                        bridge.userAction(['toggleLock']);
                     }
                 },
                 {
                     name: 'Options',
                     fa: 'fa-wrench red fa-fw',
                     fun: function () {
                        $("#navitems [href=#options]").click();
                     }
                 }];

        $('#settings').contextMenu(menu, {onOpen:function(data,e){openContextMenu(data.menu);}, onClose:function(data,e){data.menu.isOpen = 0;}, triggerOn: 'click', displayAround: 'trigger', position: 'bottom', mouseClick: 'left', sizeStyle: 'content'});

        menu = [{
                     name: 'Debug&nbsp;Window...',
                     fa: 'fa-bug red fa-fw',
                     fun: function () {
                        bridge.userAction(['debugClicked']);
                     }
                 },
                 {
                     name: 'Developer&nbsp;Tools...',
                     fa: 'fa-edit red fa-fw',
                     fun: function () {
                        bridge.userAction(['developerConsole']);
                     }
                 },
                 {
                     name: ' About&nbsp;Shadow...',
                     img: 'qrc:///icons/shadow',
                     fun: function () {
                        bridge.userAction(['aboutClicked']);
                     }
                 },
                 {
                     name: 'About&nbsp;Qt...',
                     fa: 'fa-question red fa-fw',
                     fun: function () {
                        bridge.userAction(['aboutQtClicked']);
                     }
                 }];

        $('#help').contextMenu(menu, {onOpen:function(data,e){openContextMenu(data.menu);}, onClose:function(data,e){data.menu.isOpen = 0;}, triggerOn: 'click', displayAround: 'trigger', position: 'bottom', mouseClick: 'left', sizeStyle: 'content'});
    },

    updateBalance: function(balance, shadowBal, stake, unconfirmed, immature) {
        if(balance == undefined)
            balance     = this.balance    .data("orig"),
            shadowBal   = this.shadowBal  .data("orig"),
            stake       = this.stake      .data("orig"),
            unconfirmed = this.unconfirmed.data("orig"),
            immature    = this.immature   .data("orig");
        else
            this.balance    .data("orig", balance),
            this.shadowBal  .data("orig", shadowBal),
            this.stake      .data("orig", stake),
            this.unconfirmed.data("orig", unconfirmed),
            this.immature   .data("orig", immature);

        this.formatValue("balance",     balance);
        this.formatValue("shadowBal",   shadowBal);
        this.formatValue("stake",       stake);
        this.formatValue("unconfirmed", unconfirmed);
        this.formatValue("immature",    immature);
        this.formatValue("total", balance + stake + unconfirmed + immature);
        resizeFooter();
    },

    updateReserved: function(reserved) {
        this.formatValue("reserved", reserved);
    },

    formatValue: function(field, value) {

        if(field == "total" && value != undefined && !isNaN(value))
        {
            var val = unit.format(value).split(".");

            $("#total-big > span:first-child").text(val[0]);
            $("#total-big .cents").text(val[1]);
        }

        if(field == "stake" && value != undefined && !isNaN(value))
        {
            if(value == 0)
                $("#staking-big").addClass("not-staking");
            else
                $("#staking-big").removeClass("not-staking");

            var val = unit.format(value).split(".");

            $("#staking-big > span:first-child").text(val[0]);
            $("#staking-big .cents").text(val[1]);
        }

        field = this[field];

        if(value == 0) {
            field.html("");
            field.parent("tr").hide();
        } else {
            field.text(unit.format(value));
            field.parent("tr").show();
        }
    },
    recent: function(transactions) {
        for(var i = 0;i < transactions.length;i++)
            overviewPage.updateTransaction(transactions[i]);

        $("#recenttxns [title]").off("mouseenter").on("mouseenter", tooltip)
    },
    updateTransaction: function(txn) {
        var format = function(tx) {

            return "<a id='"+tx.id.substring(0,17)+"' title='"+tx.tt+"' class='transaction-overview' href='#' onclick='$(\"#navitems [href=#transactions]\").click();$(\"#"+tx.id+"\").click();'>\
                                                <span class='"+(tx.t == 'input' ? 'received' : (tx.t == 'output' ? 'sent' : (tx.t == 'inout' ? 'self' : 'stake')))+" icon no-padding'>\
                                                  <i class='fa fa-"+(tx.t == 'input' ? 'angle-left' : (tx.t == 'output' ? 'angle-right' : (tx.t == 'inout' ? 'angle-down' : 'money')))+" font-26px margin-right-10'></i>"
                                                +unit.format(tx.am)+" </span> <span> "+unit.display+" </span> <span class='overview_date' data-value='"+tx.d+"'>"+tx.d_s+"</span></a>";

        }

        var sid = txn.id.substring(0,17);

        if($("#"+sid).attr("title", txn.tt).length==0)
        {
            var set = $('#recenttxns a');
            var txnHtml = format(txn);

            var appended = false;

            for(var i = 0; i<set.length;i++)
            {
                var el = $(set[i]);

                if (parseInt(txn.d) > parseInt(el.find('.overview_date').data("value")))
                {
                    el.before(txnHtml);
                    appended = true;
                    break;
                }
            }

            if(!appended)
                $("#recenttxns").append(txnHtml);

            set = $('#recenttxns a');

            while(set.length > 7)
            {
                $("#recenttxns a:last").remove();

                set = $('#recenttxns a');
            }
        }

        /*
        if (set.length == 0)
        {
            $("#recenttxns").append(format(txn));

            //return;
        }

        var sid = txn.id.substring(0,17);

        set.each(function(index) {
            var el = $(this);
            console.log(index);
            if (txn.date > el.find('.overview_date').attr("data-value"))
                el.before(format(txn));
            else
                el.after(format(txn));

            if (set.length >= 7)
                $("#recenttxns a:last").remove();

            return;
        });*/
    },
    clientInfo: function() {
        $('#version').text(bridge.info.build.replace(/\-[\w\d]*$/, ''));
        $('#clientinfo').attr('title', 'Build Desc: ' + bridge.info.build + '\nBuild Date: ' + bridge.info.date).on('mouseenter', tooltip);
    },
    encryptionStatusChanged: function(status) {
        switch(status)
        {
        case 0: // Not Encrypted
        case 1: // Unlocked
        case 2: // Locked
        }
    }
}

