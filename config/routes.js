module.exports.routes = {
    '/': {
        view: 'home/index'
    },
    '/generator': {
        controller: 'QrController',
        action: 'gen'
    }
};
