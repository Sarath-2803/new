// @ts-nocheck
require('dotenv').config();
const fs = require('fs');
const pg = require('pg');
const url = require('url');

const config = {
    user: "avnadmin",
    password: process.env.PG_PASSWORD,
    host: "myshop-pg-db-myshop-proj.f.aivencloud.com",
    port: 14640,
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: false,
//         ca: `-----BEGIN CERTIFICATE-----
// MIIEUDCCArigAwIBAgIUPGD44bVrN9QKAmqjCSPTtmQCRGMwDQYJKoZIhvcNAQEM
// BQAwQDE+MDwGA1UEAww1MjM1OGEzODYtMmUxZC00MDFiLWI3NjYtNzYyYzg0YWVj
// ZTQ2IEdFTiAxIFByb2plY3QgQ0EwHhcNMjUwNjA4MTc0NzIxWhcNMzUwNjA2MTc0
// NzIxWjBAMT4wPAYDVQQDDDUyMzU4YTM4Ni0yZTFkLTQwMWItYjc2Ni03NjJjODRh
// ZWNlNDYgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
// AYoCggGBAJ9S8/lfemAKYnglm0MfqzL0q06KSa7ackWXuLPzjku+S4atTgSZFxMR
// DgcBsTgnY/eRCRzSueNf66sM7Vap+CwNSBeJwXnjBw9whxOw7htnBSsfzlfsEJUp
// jejNusGqpqldKjbhM9GKiB5Frfgn6369lWvi5MnK55c3VB9eR3fpxy2Fh8zNlj9I
// WhjblZaKQUL5sucPGYglyOOJcvlvo1DLL/wRM3wdJjHgnSC/PnfU5RusIQY6R52C
// AvFl324NhcUGodEToMxBhwsQG6cWDKKk/DxPOY7RjxCSLrOrfSrPR2lanGqr5Lvj
// LDZyKjDf2kUK8jzjZFDEgFGy2aBwA0plnMVHaJxOZw2ii+D9Mfo7L6qGD/vVppUo
// 342JAQx7di6uIlJahlKbp29zCRYwmjGPZIC6n3o2fmclOg0CVT3F0jC0wk8uqqzz
// ShMg4+w5SZR6tySHm+20B6IeEgSzQwXne0jr1FAy/hG0XRmrDKU2iZNOzhejbImU
// 6EWQITx9HwIDAQABo0IwQDAdBgNVHQ4EFgQUbVPaJChznUmqb4IDYsw0QIcmkUYw
// EgYDVR0TAQH/BAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQAD
// ggGBAGBxMijyRPkWCuWh7R6G6IEW5vm1TkH0x3a81Q1o8/r5uzoNxT0BABGceCab
// PA4WbwmUYIlaZawMRrIXAhg11E+i55EdZnhfF1OBLcHl6Q7D/Jle+Wtwv+X+TBhC
// 4mpU7oNU7IeYFLwaxfMNIFlAogCIMR3766d1yz4K+dXs4s0ViTRx7Y8NFn78tqg0
// inewSUgExSnASkjZG1kB6yo4uOW621jOGqFY5KAFyFsHiALpyeAJRJqTK3E7o53v
// 5M+i/lRoZqV2VX5yyUl3A/ciTkBrjvEDJ5I4kKAhbwtfJ4OyfsNkOFHZY7+g6nFo
// QEfy052/1nKajx3sQrHpVzuDaOEmqki6s6CES35RBBh6dgDpkfJ15vKIVpyOE0KN
// Ch7XxzDw82G4QC/PnTNUhTwGIbpMAT7M2X0qMldeGpEN3Fhe8uabfNLOcRWMPTkS
// 5ZpEDLf3D7x0wK0xLlohzpvrHdcIxVwbgtmrp8sA4HgaHCp2DWo6wacMmhBzb0u0
// wRLBRw==
// -----END CERTIFICATE-----`,
    },
};

const client = new pg.Client(config);
client.connect(function (err) {
    if (err)
        throw err;
    client.query("SELECT VERSION()", [], function (err, result) {
        if (err)
            throw err;

        console.log(result.rows[0].version);
        client.end(function (err) {
            if (err)
                throw err;
        });
    });
});