// Register service worker to control making site work offline
// make the whole serviceworker process into a promise so later on we can
// listen to it and in case new content is available a toast will be shown
window.isUpdateAvailable = new Promise(function(resolve, reject) {
	// lazy way of disabling service workers while developing
	if ('serviceWorker' in navigator && ['localhost', '127'].indexOf(location.hostname) === -1) {
		// register service worker file
		navigator.serviceWorker.register('/t/sw.js')
			.then(reg => {
				reg.onupdatefound = () => {
					const installingWorker = reg.installing;
					installingWorker.onstatechange = () => {
						switch (installingWorker.state) {
							case 'installed':
								if (navigator.serviceWorker.controller) {
									// new update available
									resolve(true);
								} else {
									// no update available
									resolve(false);
								}
								break;
						}
					};
				};
			})
			.catch(err => console.error('[SW ERROR]', err));
	}
});

// Code to handle install prompt on desktop
let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', (e) => {
    // hide our user interface that shows our button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
  });
});
window['isUpdateAvailable']
	.then(isAvailable => {
		if (isAvailable) {
			const toast = this.toastCtrl.create({
				message: 'New Update available! Reload the webapp to see the latest juicy changes.',
				position: 'bottom',
				showCloseButton: true,
			});
			toast.present();
		}
	});
