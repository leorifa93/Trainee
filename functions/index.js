/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const admin = require("firebase-admin");
const functions = require('firebase-functions');

admin.initializeApp({
    "type": "service_account",
    "project_id": "marius-fitline-4e2f8",
    "private_key_id": "8f2bade5648b57bb6d739d9b86a7a420798a16ec",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCUUm/tBYzX3VLk\nnWoW+kuaKyzte6p3EvjLkpv0lUVgK9ZANQfqE0Hnn7zXEUAuer8/T4IPI5xHy4qj\nLXMGc3GFUHZ5aZ6rgn7cCXH3jptmgM881nLHw9c5ahONgKZSkBLxf7o7oh1aLWNo\nRC68JM1YKkjAK+EX74k8D6Bu4aNZogMwQ1AKDy/6lKLwEcAioWJnlQU9D58Sq+0p\nTfp69wfPyu39FoeMb1h52hn/qasBn+PTwiKsj28sFBLUXATumtqTMw0pyhsT6iH9\newp6CIj++4Hqo2VuNl8GZhZv0WI3Tfi+WyTOaxNlToXAiV0tUhyfG6lIysu/+x/8\nb0Q9kUu7AgMBAAECggEAGWnKjaT+zdm5Izypechm/cJaD1K6EW7pvA+hsxWEbob0\nTcoIUh38k9A1ze/BvHUBobpgwXFLjK2eUnkuFTPghoQT2Je1PRO94runkFAZ5kU5\nvOXNgtbWYJsBQKSDWvAensxQv3j2aIYQW0Qbcdcoa+vKzUp3Zd9/9w+CYJ0+nNO3\ny6tlqbXosngUa8XjVQSijGo0K3l1zDjlOGJq/p2r+WkUkU6GzscwbitUBGjS/yV6\nzzIWVxbcwGXoWzOMx1ZkcrrWGoIz+mXn0FGkjqJ2pksAyOpvfGrbqMmbfs37VlW6\n6pZXH9NQZGc0Rhv+zUBfnV7NApSeXDTmOwIvacw8YQKBgQDDavzKl1e/WhHazFws\nVn3ZeWcR4kre/PfIrwrUvEi8t/Ru9y6auZB7GOf4p7H85VMZpq1uw9Ou2Ts6fFsh\nkoiTXjiycnVFu42ADIZSzN0ypFe7S/qTOYkZXYvnss3aQT0YaLetToBNiyY1fzZ1\nbAkMymDI+4HCxG9HJODOtlxEMQKBgQDCTcNsr9kafLM69EJmHLVFMjEhBsnrVwzR\nKrpZofClKqUjhoIJqAhxmpW/gAcDlNKdnPnyyEOniUBJJXZSV+sR/k003QhP02IT\nla9G+qMFW6DDxZf20qjwT8BM3jhCiKIptuOyFkiPMFIcG9Zt/BPmUkriGCDpaUSG\nSsqdGybvqwKBgEAbCcB/81Yfevn2zknxOams7MXuITeTbsmTuo7dEVNvWS1Jwy0Y\nsK/hFL/6ayYWKLOifQR4EyopswdVoiOaSVlmsFzBtXzhsOKPuUTSVcH2LZ2QqCvB\n1RrQGEQy4Nq3Sg6G07JzrR1DB47HI5tTjIh4n1VvRDsba5HAJEtLgWsRAoGAeVlb\nrat9aZ9ryGv4dBGF3HtmV3wH62ToalHHJGeRBXZGwJMm76Tz8Q9cascomkH979Wz\n/L66Eg4UChrNdMvX0dsCmPtaT5By9kxLtYae/Z+mHd5v9ATI4ZzNOrSmalcu/+Jq\n/jQQiOziuw9fsjz2qKfIgMAU/fFyjHR1af0lKhUCgYEAwWw1PkG3aTWG/VcLsBzJ\nA4MF7neLyc13WwDGvjRIONVBY0SeasiZGibNMmN8JsdHY+pgq1sSJkQBzrq4uc4C\nXaSqaNa6/p1/dqhV+GYcHWLbUdamV94evXgvYBnPch5CJNI9iJjRTUP4XDXHkUVv\nefu7F7SUa8PONW5Rq6uV7+4=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-y2ra8@marius-fitline-4e2f8.iam.gserviceaccount.com",
    "client_id": "106066688311807281820",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-y2ra8%40marius-fitline-4e2f8.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }
);

exports.userUpdate = functions
  .firestore
  .document('Users/{userId}')
  .onUpdate((change, context) => {
    const userBefore = change.before.data();
    const userAfter = change.after.data();

    if ((userBefore && userAfter) && userBefore.status === 2 && userAfter.status === 1) {
      if (userAfter.pushDeviceId) {
        console.log("sent push");
        admin.messaging().sendToDevice(userAfter.pushDeviceId, {
          notification: {
            title: 'Wilkommen im Team!',
            body: 'Der Admin hat soeben deine Registrierung akzeptiert. Lege jetzt los 🚀'
          }
        })
      }
    }
  });

exports.userCreate = functions
  .firestore
  .document('Users/{userId}')
  .onCreate((change, context) => {
    const user = change.data();

    admin.messaging().sendToTopic('admin', {
      notification: {
        title: 'Neue Registrierung',
        body: 'Schaue jetzt nach 🚀'
      }
    })

    admin
      .firestore()
      .collection("mail")
      .add({
        to: "Marius.bublitz@gmx.de",
        message: {
          subject: "Neue Registrierung: " + user.tpNumber,
          html: `${user.fullName} mit der TP Nummer ${user.tpNumber}, hat sich soeben in der App registriert. Bitte gehe in die App um den Benutzer zu akzeptieren/abzulehnen.`,
        },
      })
      .then(() => console.log("Queued email for delivery!"));
  });
