var SftpClientView = Backbone.View.extend({


    events: {
        "click #consoleShow": "initConsole",
        "click #clearConsole": "flushConsole",
        "click .move": "moveTo",
        "click #removeHost": "removeSftpHost",
        "change select#host": "moveTo",
        "click .getFile": "getFile"
    },

    initialize: function () {
        this.template = _.template($('#browserList').html());
        this.listenTo(this.model, "change", this.render);
    },

    removeSftpHost: function () {
        if (confirm('you are sure')) {
            app.ajax('/sftp/remove-host', {id: app.sftp.host_id()});
            $("select#host option:selected").remove();
            this.flushConsole();
            if (!app.sftp.host_id()) {
                this.$el.find('#browse').remove();
            } else this.moveTo();
        }
    },


    render: function () {
        var view = this.template({
            'list': this.model.get('list'),
            'dir': this.model.get('dir')
        });
        this.$el.find('#browse').html(view);
        this.initContext();
    },

    initConsole: function () {
        if (!this.console) {
            app.sftp.ConsoleModel = new ConsoleModel();
            this.console = new ConsoleView({
                el: "#client",
                model: app.sftp.ConsoleModel
            });
            this.console.toggle();
        } else this.console.toggle();

    },

    initContext: function () {
        $.contextMenu({
            selector: '#tableBrowse td.move',
            items: {
                "NewFile": {
                    name: "New file",
                    icon: "fa-file-code-o",
                    callback: function (itemKey, opt) {
                        console.log(opt.$trigger.attr('data-target'));

                    }
                },
                "NewFolder": {name: "New folder", icon: "fa-folder"},
                "EditFolder": {name: "Edit folder", icon: "fa-edit"},
                "Move": {name: "Move", icon: "fa-chevron-right"},
                "Delete": {name: "Delete", icon: "fa-bitbucket"}
            }
        });
        $.contextMenu({
            selector: '#tableBrowse td.getFile',
            items: {
                "Edit": {
                    name: "Edit file",
                    icon: "fa-edit",
                    callback: function (itemKey, opt) {
                        console.log(opt.$trigger.attr('data-target'));

                    }
                },
                "OpenInEditor": {
                    name: "Open in editor",
                    icon: "fa-file-code-o",
                    callback: function (itemKey, opt) {
                        console.log(opt.$trigger.attr('data-target'));

                    }
                },
                "Delete": {name: "Delete file", icon: "fa-bitbucket"}
            }
        });
    },

    flushConsole: function () {
        if (this.console)
            this.console.flush();
    },

    getFile: function (event) {
        var file = $(event.currentTarget).attr('data-target').slice(0, -1);
        var path = this.model.get('dir') + '/' + file;
        var response = app.ajax('/sftp/get', {
            path: path,
            filename: file,
            extension: getExtensionFile(file),
            hostId: app.sftp.host_id()
        }, false);
        if (response === 'Is not read') app.error(response);
        else {
            var model = JSON.parse(response);
            editor.load(model.contentFile, model.mode);
        }
    },

    moveTo: function (event) {
        if (event)
            var folder = $(event.currentTarget).attr('data-target');

        var currentDir = this.model.get('dir');
        var dir;

        if (!folder) dir = currentDir;
        else dir = currentDir + "/" + folder;

        var response = app.sftp.command('/sftp/move', {
            dir: dir,
            hostId: app.sftp.host_id()
        });
        this.model.set(response);
    }
});
