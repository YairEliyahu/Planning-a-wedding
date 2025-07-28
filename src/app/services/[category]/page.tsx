'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

// מידע על קטגוריות הספקים - מיובא מהדף הראשי
const serviceCategories = [
  {
    id: 'venues',
    title: 'אולמות ומקומות אירוח',
    description: 'מבחר אולמות וגני אירועים מהיפים בארץ',
    icon: 'fas fa-map-marker-alt',
    bgColor: '#ffebee',
    iconColor: '#e53935'
  },
  {
    id: 'photographers',
    title: 'צלמים וצילום',
    description: 'צלמי סטילס, וידאו ודרונים לתיעוד היום המיוחד',
    icon: 'fas fa-camera',
    bgColor: '#e8f5e9',
    iconColor: '#43a047'
  },
  {
    id: 'catering',
    title: 'קייטרינג והסעדה',
    description: 'שפים ושירותי קייטרינג איכותיים',
    icon: 'fas fa-utensils',
    bgColor: '#fff3e0',
    iconColor: '#fb8c00'
  },
  {
    id: 'music',
    title: 'תקליטנים והופעות',
    description: 'תקליטנים, להקות ואמנים להופעה בחתונה',
    icon: 'fas fa-music',
    bgColor: '#e3f2fd',
    iconColor: '#1e88e5'
  },
  {
    id: 'dresses',
    title: 'שמלות ואופנה',
    description: 'מעצבי שמלות כלה, חליפות חתן ואביזרים',
    icon: 'fas fa-female',
    bgColor: '#f3e5f5',
    iconColor: '#8e24aa'
  },
  {
    id: 'groomSuits',
    title: 'חליפות חתן',
    description: 'חליפות חתן ואביזרים',
    icon: 'fas fa-male',
    bgColor: '#e0f7fa',
    iconColor: '#00796b'
  },
  {
    id: 'jewelry',
    title: 'תכשיטים וטבעות',
    description: 'טבעות אירוסין, תכשיטים ואקססוריז לכלה',
    icon: 'fas fa-ring',
    bgColor: '#fffde7',
    iconColor: '#fdd835'
  },
  {
    id: 'flowers',
    title: 'פרחים ועיצוב',
    description: 'עיצוב פרחוני, סידורי שולחן ודקורציה',
    icon: 'fas fa-leaf',
    bgColor: '#e0f7fa',
    iconColor: '#00acc1'
  },
  {
    id: 'makeup',
    title: 'איפור ושיער',
    description: 'מאפרים ומעצבי שיער ליום החתונה',
    icon: 'fas fa-magic',
    bgColor: '#fce4ec',
    iconColor: '#d81b60'
  },
];

// דוגמאות לספקים (יש למלא בספקים אמיתיים בהמשך)
const dummyVendors = {
  venues: [
    { id: 1, name: 'LAGO', location: 'ראשון לציון', area: 'מרכז', price: '₪₪₪₪', image: '/images/venues/lago.jpg', imageSource: 'אתר המקום', website: 'https://www.lago-events.co.il/' },
    { id: 2, name: 'האחוזה מודיעין', location: 'מודיעין', area: 'מרכז', price: '₪₪₪₪', image: '/images/venues/aahuza.jpg', imageSource: 'אתר המקום', website: 'https://www.haahuzah.co.il/' },
    { id: 3, name: 'EAST', location: 'תל אביב', area: 'מרכז', price: '₪₪₪₪', image: '/images/venues/east.jpg', imageSource: 'אתר המקום', website: 'https://east-tlv.co.il/' },
    { id: 4, name: 'ריברסייד', location: 'תל אביב', area: 'מרכז', price: '₪₪₪₪', image: '/images/venues/riverside.jpg', imageSource: 'אתר המקום', website: 'https://www.riverside.co.il/' },
    { id: 5, name: 'טרויה', location: 'ראשון לציון', area: 'מרכז', price: '₪₪₪', image: '/images/venues/troya.jpg', imageSource: 'אתר המקום', website: 'https://troya-garden.co.il/' },
    { id: 6, name: 'שבע', location: 'תל אביב', area: 'מרכז', price: '₪₪₪₪', image: '/images/venues/sheva.jpg', imageSource: 'אתר המקום', website: 'https://www.sheva.co.il/' },
    { id: 7, name: 'קיסר ים', location: 'קיסריה', area: 'שרון', price: '₪₪₪₪', image: '/images/venues/keisarYam.jpg', imageSource: 'אתר המקום', website: 'https://www.caesaryam.com/' },
    { id: 8, name: 'הגלריה', location: 'כפר ויתקין', area: 'שרון', price: '₪₪₪', image: '/images/venues/agaleria.jpg', imageSource: 'אתר המקום', website: 'https://gallery-event.co.il/' },
    { id: 9, name: 'גן ורדים', location: 'אבן יהודה', area: 'שרון', price: '₪₪₪', image: '/images/venues/ganVradim.jpg', imageSource: 'אתר המקום', website: 'https://www.gvradim.com/' },
    { id: 10, name: 'עלמה', location: 'תל מונד', area: 'שרון', price: '₪₪₪', image: '/images/venues/alma1.jpg', imageSource: 'אתר המקום', website: 'https://almahouse.co.il/' },
    { id: 11, name: 'Q גן אירועים', location: 'גליל ים', area: 'שרון', price: '₪₪₪₪', image: '/images/venues/Q.jpg', imageSource: 'אתר המקום', website: 'https://qce.co.il/' },
    { id: 12, name: 'אגדתא', location: 'בארותיים', area: 'שרון', price: '₪₪₪', image: '/images/venues/agadata.jpg', imageSource: 'אתר המקום', website: 'https://agadata.com/' },
    { id: 13, name: 'גני כנען', location: 'חיפה', area: 'צפון', price: '₪₪₪', image: '/images/venues/ganeCnaan.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 14, name: 'ביער', location: 'חדרה', area: 'צפון', price: '₪₪₪', image: '/images/venues/bayaar.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 15, name: 'קסיופיאה', location: 'הרצליה (חוף ים)', area: 'צפון', price: '₪₪₪₪', image: '/images/venues/ksiopia.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 16, name: 'אמארה', location: 'עפולה', area: 'צפון', price: '₪₪₪', image: '/images/venues/amara.jpg', imageSource: 'אתר המקום', website: 'https://www.amare.co.il/' },
    { id: 17, name: 'טופ דוראן', location: 'צומת כפר קרע', area: 'צפון', price: '₪₪₪', image: '/images/venues/topDoran.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 18, name: 'שמיים וארץ', location: 'כרמל', area: 'צפון', price: '₪₪₪₪', image: '/images/venues/shamaimVaaretz.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 19, name: 'חוות רונית', location: 'אזור הרי יהודה', area: 'דרום', price: '₪₪₪', image: '/images/venues/havatRonit.jpg', imageSource: 'אתר המקום', website: 'https://ronitfarm.com/' },
    { id: 20, name: 'נסיה', location: 'באר שבע', area: 'דרום', price: '₪₪', image: '/images/venues/nesia.jpg', imageSource: 'אתר המקום', website: 'https://nesyaevent.co.il/' },
    { id: 21, name: 'בית על הים', location: 'אשקלון', area: 'דרום', price: '₪₪₪', image: '/images/venues/baitAlAyam.jpg', imageSource: 'אתר המקום', website: 'https://www.housea.co.il/' },
    { id: 22, name: 'סופיה', location: 'באר שבע', area: 'דרום', price: '₪₪', image: '/images/venues/sofia.jpg', imageSource: 'אתר המקום', website: 'https://sofiaevent.co.il/' },
    { id: 23, name: 'חצר המלכה', location: 'קריית מלאכי', area: 'דרום', price: '₪₪', image: '/images/venues/hazerAmalca.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 24, name: 'אחוזת טל', location: 'אשדוד', area: 'דרום', price: '₪₪₪', image: '/images/venues/ahuzatTal.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 25, name: 'עין יעל', location: 'גן ארכיאולוגי פתוח', area: 'ירושלים', price: '₪₪₪', image: '/images/venues/einYael.jpg', imageSource: 'אתר המקום', website: 'https://ein-yael.co.il/' },
    { id: 26, name: 'קדם', location: 'מעלה החמישה', area: 'ירושלים', price: '₪₪₪', image: '/images/venues/kedem.jpg', imageSource: 'אתר המקום', website: 'https://www.kedem.io/' },
    { id: 27, name: 'בית הברכה', location: 'גוש עציון', area: 'ירושלים', price: '₪₪₪', image: '/images/venues/beitAbraha.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 28, name: 'ויה', location: 'ירושלים', area: 'ירושלים', price: '₪₪₪₪', image: '/images/venues/via.jpg', imageSource: 'אתר המקום', website: 'https://via-events.co.il/' },
    { id: 29, name: 'וולקאן', location: 'ירושלים', area: 'ירושלים', price: '₪₪₪', image: '/images/venues/volkan.jpg', imageSource: 'אתר המקום', website: 'https://volcanevents.co.il/' },
    { id: 30, name: 'החצר האחורית', location: 'מושב אורה', area: 'ירושלים', price: '₪₪₪', image: '/images/venues/ahazerAahorit.jpg', imageSource: 'אתר המקום', website: 'https://www.thebackyard.co.il/' },
  ],
  photographers: [
    { id: 1, name: 'סלקט מגנטים', location: 'ארצי', area: 'ארצי', price: '₪₪₪', image: '/images/photographers/select.png', website: 'https://smagnetim.co.il/',phone: '050-1234567',averagePrice: '₪8,000',popularity: '⭐⭐⭐⭐⭐',availability: 'זמין ל-2024'},
    { id: 2, name: 'מגנטלי', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/photographers/magnetli.png', website: 'https://magnetli.co.il/',phone: '050-2345678',averagePrice: '₪10,000',popularity: '⭐⭐⭐⭐',availability: 'זמין ל-2024'},
    { id: 3, name: 'דוקטור מגנט', location: 'אזור הצפון', area: 'צפון', price: '₪₪', image: '/images/photographers/doctor.jpg', website: 'https://drmagnet.co.il/',phone: '050-3456789',averagePrice: '₪6,000',popularity: '⭐⭐⭐',availability: 'זמין ל-2024'},
    { id: 4, name: 'יויו מגנט', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪', image: '/images/photographers/yoyo.jpg', website: 'https://yoyomagnet.com/' },
    { id: 5, name: 'אושרי צילום', location: 'אזור הצפון', area: 'צפון', price: '₪₪₪₪', image: '/images/photographers/oshri.jpg', website: 'https://oshri-photo.co.il/' },
    { id: 6, name: 'אדם שמשי', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/photographers/adam.jpg', website: '' },
    { id: 7, name: 'סברס צלמים', location: 'אזור הדרום', area: 'דרום', price: '₪₪₪', image: '/images/photographers/sabres.jpg', website: 'https://www.sabres.photography/' },
    { id: 8, name: 'Unique Photography', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/photographers/unique.jpg', website: '' },
    { id: 9, name: 'Daniel Notcake', location: 'אזור הצפון', area: 'צפון', price: '₪₪₪₪', image: '/images/photographers/daniel.jpg', website: 'https://en.danielnotcake.com/' },
    { id: 10, name: 'אלכס מלינסקי', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪', image: '/images/photographers/alex.jpg', website: '' },
    { id: 11, name: 'אור גליקמן', location: 'אזור הצפון', area: 'צפון', price: '₪₪₪', image: '/images/photographers/or.jpg', website: 'https://www.orglickman.com/' },
    { id: 12, name: 'תום סיימון', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/photographers/tom.jpg', website: 'http://tomsaimon.com/' },
    { id: 13, name: 'דימה וזינוביץ', location: 'אזור הדרום', area: 'דרום', price: '₪₪₪', image: '/images/photographers/dima.jpg', website: 'https://www.dvwed.com/' },
    { id: 14, name: 'צחי שמש', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/photographers/zahi.png', website: 'https://www.tzahishemesh.com/' },
    { id: 15, name: 'אספוסה ', location: 'אזור הצפון', area: 'צפון', price: '₪₪₪₪', image: '/images/photographers/esposa.jpg', website: 'https://www.esposa.co.il/' }
  ],
  catering: [
    { id: 1, name: 'מרינדה קייטרינג', location: 'אזור הצפון', area: 'צפון', price: '₪₪₪', image: '/images/catering/marinda.jpg', website: 'https://marinada.co.il/' },
    { id: 2, name: 'טארטן | פשוט טעים', location: 'אזור הצפון', area: 'צפון', price: '₪₪₪₪', image: '/images/catering/tarten.jpg', website: '' },
    { id: 3, name: 'קייטרינג דאבל קיי', location: 'אזור הצפון', area: 'צפון', price: '₪₪', image: '/images/catering/dabel.jpg', website: '' },
    { id: 4, name: 'קייטרינג הלל ', location: 'אזור הצפון', area: 'צפון', price: '₪₪₪', image: '/images/catering/alel.jpg', website: 'https://catering-halel.co.il/' },
    { id: 5, name: 'קייטרינג מאמא', location: 'ארצי', area: 'צפון, מרכז, דרום', price: '₪₪₪₪', image: '/images/catering/mama.jpg', website: 'https://teamimofmama.com/' },
    { id: 6, name: 'קייטרינג מרלו', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/catering/merlo.jpg', website: 'https://www.merlo-c.co.il/' },
    { id: 7, name: 'קייטרינג ביסקוטי', location: 'אזור הדרום', area: 'דרום', price: '₪₪₪', image: '/images/catering/biscoti.jpg', website: 'https://www.biscotti.co.il/catering' },
    { id: 8, name: 'שף אסאדו ', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/catering/asado.png', website: 'https://asado4u.co.il/' },
    { id: 9, name: 'קייטרינג משהו מיוחד', location: 'אזור הצפון', area: 'צפון', price: '₪₪₪₪', image: '/images/catering/special.jpg', website: 'https://special-catering.co.il/' },
    { id: 10, name: 'קייטרינג האחים שופן', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪', image: '/images/catering/shufan.jpg', website: 'https://shufan-katering.co.il/' },
    { id: 11, name: 'קייטרינג שורשים', location: 'אזור הצפון', area: 'צפון', price: '₪₪₪', image: '/images/catering/shorashim.jpg', website: 'https://shorashim-catering.co.il/' },
    { id: 12, name: 'קייטרינג מרקש', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/catering/maracesh.jpg', website: 'https://catering-marakesh.co.il/' },
    { id: 13, name: 'קייטרינג תבלין', location: 'אזור הדרום', area: 'דרום', price: '₪₪₪', image: '/images/catering/tavlin.jpg', website: 'https://www.tavlinbagan.co.il/' },
    { id: 14, name: 'מאסטר מיט', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/catering/master.jpg', website: 'https://www.master-meat.com/' },
    { id: 15, name: 'תבל מרכז אירועים', location: 'איזור הדרום', area: 'דרום', price: '₪₪₪₪', image: '/images/catering/tevel.jpg', website: 'https://tevel-event.co.il/' }
  ],
  music: [
    { id: 1, name: 'DJ אריאל אל בי', location: 'קריית ביאליק', area: 'צפון', price: '₪₪₪', image: '/images/music/ariel.jpg',  instagram: 'https://www.instagram.com/djariellb/' },
    { id: 2, name: 'דינו – מוזיקה לאירועים', location: 'נשר', area: 'צפון', price: '₪₪₪₪', image: '/images/music/dino.jpg',  instagram: 'https://www.instagram.com/djdino_dinelimelech/' },
    { id: 3, name: 'DJ איתן כרמי', location: 'חיפה', area: 'צפון', price: '₪₪₪', image: '/images/music/etan.jpg',  instagram: '' },
    { id: 4, name: 'DJ טל דואק', location: 'חיפה', area: 'צפון', price: '₪₪₪', image: '/images/music/tal.jpg',  instagram: 'https://www.instagram.com/djtaldoek/' },
    { id: 5, name: 'DJ עמית אלימלך', location: 'יקנעם עילית', area: 'צפון', price: '₪₪₪₪', image: '/images/music/amit.jpg',  instagram: 'https://www.instagram.com/djamitelimelech/' },
    { id: 6, name: 'DJ שחר רונן', location: 'ארצי', area: 'ארצי', price: '₪₪₪₪', image: '/images/music/shahar.jpg',  instagram: 'https://www.instagram.com/djshaharronen/' },
    { id: 7, name: 'DJ יובל לויים', location: 'ארצי', area: 'ארצי', price: '₪₪₪₪', image: '/images/music/yuval.jpg',  instagram: '' },
    { id: 8, name: 'DJ גיא חליוה', location: '', area: '', price: '₪₪₪₪', image: '/images/music/guy.jpg',  instagram: 'https://www.instagram.com/guy_haliva' },
    { id: 9, name: 'DJ ברק מיטלמן', location: 'ארצי', area: 'ארצי', price: '₪₪₪₪', image: '/images/music/barak.jpg',  instagram: '' },
    { id: 10, name: 'DJ צחי גרין', location: 'ארצי', area: 'ארצי', price: '₪₪₪', image: '/images/music/tzahi.jpg',  instagram: '' },
    { id: 11, name: 'DJ בנדא (בן אלבז)', location: 'אשקלון', area: 'דרום', price: '₪₪₪', image: '/images/music/benda.jpg',  instagram: 'https://www.instagram.com/djbenelbaz/' },
    { id: 12, name: 'דז\'ה וו – מוזיקה ותופים (שי משולם)', location: 'אשדוד', area: 'דרום', price: '₪₪₪₪', image: '/images/music/deja.jpg',  instagram: '' },
    { id: 13, name: 'DJ דני די', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/music/danidi.jpg',  instagram: 'https://www.instagram.com/djdannydmusic' },
    { id: 14, name: 'שלומי מוסיקה והפקת אירועים', location: 'באר שבע', area: 'דרום', price: '₪₪₪₪', image: '/images/music/shlomi.jpg',  instagram: '' },
    { id: 15, name: 'שמח תשמח תקליטן דתי', location: 'קריית מלאכי', area: 'דרום', price: '₪₪₪₪', image: '/images/music/sameach.jpg',  instagram: '' }
  ],
  dresses: [
    { id: 1, name: 'גליה להב', location: ' תל אביב', area: 'מרכז', price: '₪₪₪', image: '/images/dresses/galia.webp', website: 'https://www.galialahav.com/?gad_source=1&gad_campaignid=22397884944&gbraid=0AAAAAD4hh5_hBxDZVtpc9IfLOyFI88mHv&gclid=Cj4KCQjwnJfEBhCzARItAIMtfKKdNIx75ndN4RWfcJmFtJVkdbJv8tG6Meeta0DoIlMi-m9wvL6I8nlIGgKe5BAC8P8HAQ' },
    { id: 2, name: 'דרור קונטנטו', location: 'תל אביב ', area: 'מרכז', price: '₪₪₪₪', image: '/images/dresses/dror.webp', website: 'https://drorkontento.com/' },
    { id: 3, name: 'ואדים מרגולין', location: 'תל אביב', area: 'מרכז', price: '₪₪', image: '/images/dresses/vadim.webp', website: 'https://vadimmargolin.com/' },
    { id: 4, name: 'אלון ליבנה', location: 'תל אביב', area: 'מרכז', price: '₪₪₪', image: '/images/dresses/alon.webp', website: 'https://alonlivne.com/' },
    { id: 5, name: 'אייזן שטיין', location: 'תל אביב יפו', area: 'מרכז', price: '₪₪₪₪', image: '/images/dresses/aizen.webp', website: 'https://eisen-stein.co.il/' },
    { id: 6, name: 'איב רומנו', location: 'באר שבע', area: 'דרום', price: '₪₪₪₪', image: '/images/dresses/hiv.webp', website: '',phone:'0548168422' },
    { id: 7, name: 'טלי פיטוסי', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/dresses/tali.webp', website: '',phone:'054-302-0086' },
    { id: 8, name: 'אודליה מזרחי', location: 'ירושלים', area: 'מרכז', price: '₪₪₪₪', image: '/images/dresses/odelia.webp', website: '',phone:'052-502-2270' },
    { id: 9, name: 'אריאלה כסלו', location: 'מודיעין', area: 'מרכז', price: '₪₪₪₪', image: '/images/dresses/ariela.webp', website: 'https://www.bridesinmodiin.co.il/' },
    { id: 10, name: 'ישראל אוחיון', location: 'מבשרת ציון', area: 'מרכז', price: '₪₪₪', image: '/images/dresses/israel.webp', website: 'https://www.israelohayon.com/' },
    { id: 11, name: 'יעל גולד', location: 'קריית ביאליק', area: 'צפון', price: '₪₪₪', image: '/images/dresses/yael.webp', website: 'https://www.yaelgold.com/lander' },
    { id: 12, name: 'מיקה', location: 'קריית ביאליק', area: 'צפון', price: '₪₪₪₪', image: '/images/dresses/mika.webp', website: 'https://mikabridal.co.il/' },
    { id: 13, name: 'יוליה ברוידה', location: 'אזור הדרום', area: 'דרום', price: '₪₪₪', image: '/images/dresses/yulia.webp', website: '' },
    { id: 14, name: 'סטודיו נדיה', location: 'נתיבות', area: 'דרום', price: '₪₪₪₪', image: '/images/dresses/nadia.webp', website: 'https://www.studionadia.net/' },
    { id: 15, name: 'ריקי דלאל', location: 'אשדוד', area: 'מרכז', price: '₪₪₪₪', image: '/images/dresses/riki.webp', website: 'https://www.rikidalal.co.il/' }
  ],
  groomSuits: [
    { id: 1, name: 'ספוסו', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/suits/sposo.webp', website: '' ,phone:'052-262-9982'},
    { id: 2, name: 'אלול', location: 'באר שבע', area: 'דרום', price: '₪₪₪₪', image: '/images/suits/elul.webp', website: '',phone:'052-640-5405' },
    { id: 3, name: 'בולגריו', location: 'באר שבע', area: 'דרום', price: '₪₪', image: '/images/suits/bulgario.webp', website: 'https://bulgaryo.com/' },
    { id: 4, name: 'אלי אזולאי', location: 'נתיבות', area: 'דרום', price: '₪₪₪', image: '/images/suits/eli.webp', website: 'https://www.eli-azulay.co.il/' },
    { id: 5, name: 'סוטס חליפות', location: 'אשקלון', area: 'דרום', price: '₪₪₪₪', image: '/images/suits/suts.webp', website: '',phone:'050-687-2282' },
    { id: 6, name: 'סאלינה', location: 'רמת גן', area: 'מרכז', price: '₪₪₪₪', image: '/images/suits/salina.webp', website: 'https://salina-fashion.com/?utm_source=googlemybusiness&utm_medium=organic&utm_campaign=GoogleMyBusiness' },
    { id: 7, name: 'פנגארי', location: 'ראשון לציון', area: 'מרכז', price: '₪₪₪', image: '/images/suits/fengari.webp', website: 'https://fengari.co.il/' },
    { id: 8, name: 'סגל אסי', location: 'תל אביב', area: 'מרכז', price: '₪₪₪₪', image: '/images/suits/segal.webp', website: 'https://www.segalasi.co.il/' },
    { id: 9, name: 'דיפלומט', location: 'בני ברק', area: 'מרכז', price: '₪₪₪₪', image: '/images/suits/diplomat.webp', website: 'https://diplomatline.co.il/' },
    { id: 10, name: 'יוסי בן נון', location: 'תל אביב יפו', area: 'מרכז', price: '₪₪₪', image: '/images/suits/yosi.webp ', website: 'https://halifot.co.il/' },
    { id: 11, name: 'יומה', location: 'נשר', area: 'צפון', price: '₪₪₪', image: '/images/suits/yoma.webp', website: 'https://yoma.co.il/' },
    { id: 12, name: 'זינו מילאנו', location: 'קריית מוצקין', area: 'צפון', price: '₪₪₪₪', image: '/images/suits/zino.webp', website: '' ,phone:'077-300-2699'},
    { id: 13, name: 'ליאור קיסר', location: 'כרמיאל', area: 'צפון', price: '₪₪₪', image: '/images/suits/lior.webp', website: '',phone:'04-645-4966' },
    { id: 14, name: 'אורל כאן', location: 'ירושלים', area: 'מרכז', price: '₪₪₪₪', image: '/images/suits/orel.webp', website: '',phone:'02-579-3200' },
    { id: 15, name: 'ארגו', location: 'ירושלים', area: 'מרכז', price: '₪₪₪₪', image: '/images/suits/argo.webp', website: '',phone:'02-595-3233' }
  ],
  jewelry: [
    { id: 1, name: 'תכשיטי אליס', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/jewelry/alis.webp', website: 'https://alice.jewelry/' },
    { id: 2, name: 'תכשיטי חביב', location: 'באר שבע', area: 'דרום', price: '₪₪₪₪', image: '/images/jewelry/haviv.webp', website: 'https://havivjewelry.co.il/' },
    { id: 3, name: 'הבורסה לתכשיטים', location: 'באר שבע', area: 'דרום', price: '₪₪', image: '/images/jewelry/bursaB.webp', website: 'https://www.thebursa.co.il/branch/%D7%A7%D7%A0%D7%99%D7%95%D7%9F-%D7%94%D7%A0%D7%92%D7%91-%D7%91%D7%90%D7%A8-%D7%A9%D7%91%D7%A2/' },
    { id: 4, name: 'רויטמן תכשיטים', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/jewelry/roytman.webp', website: 'https://mymulan.co.il/' },
    { id: 5, name: 'תכשיטי דניאלה', location: 'באר שבע', area: 'דרום', price: '₪₪₪₪', image: '/images/jewelry/daniela.webp', website: 'https://daniella-jewelry.co.il/' },
    { id: 6, name: 'דניאל מתת תכשיטים', location: 'רמת גן', area: 'מרכז', price: '₪₪₪₪', image: '/images/jewelry/matat.webp', website: 'https://www.daniel-matat.co.il/' },
    { id: 7, name: 'גקסון תכשיטים', location: 'רמת גן', area: 'מרכז', price: '₪₪₪', image: '/images/jewelry/jecson.webp', website: 'https://jackson.co.il/' },
    { id: 8, name: 'תכשיטי הוד והדר', location: 'תל אביב יפו', area: 'מרכז', price: '₪₪₪₪', image: '/images/jewelry/hod.webp', website: '',phone:'03-522-1885' },
    { id: 9, name: 'תכשיטי זיו אור', location: 'רמת גן', area: 'מרכז', price: '₪₪₪₪', image: '/images/jewelry/ziv.webp', website: 'https://www.ziv-or.com/' },
    { id: 10, name: 'תכשיטי אלי פז', location: 'תל אביב יפו', area: 'מרכז', price: '₪₪₪', image: '/images/jewelry/eli.webp', website: 'https://eli-paz.co.il/' },
    { id: 11, name: 'תכשיטי רויאלטי', location: 'עכו', area: 'צפון', price: '₪₪₪', image: '/images/jewelry/royalty.webp', website: 'https://www.royalty.me/' },
    { id: 12, name: 'אביב תכשיטים', location: 'קריית אתא', area: 'צפון', price: '₪₪₪₪', image: '/images/jewelry/aviv.webp', website: '',phone:'04-845-4267' },
    { id: 13, name: 'אורית תכשיטים', location: 'עפולה', area: 'צפון', price: '₪₪₪', image: '/images/jewelry/orit.webp', website: 'https://www.orit-jewelry.co.il/' },
    { id: 14, name: 'הבורסה לתכשיטים', location: 'קריית ביאליק', area: 'צפון', price: '₪₪₪₪', image: '/images/jewelry/bursaK.webp', website: 'https://www.thebursa.co.il/branch/%D7%94%D7%A7%D7%A8%D7%99%D7%95%D7%9F-%D7%A7%D7%A8%D7%99%D7%99%D7%AA-%D7%91%D7%99%D7%90%D7%9C%D7%99%D7%A7/' },
    { id: 15, name: 'שי תכשיטים', location: 'קריית אתא', area: 'צפון', price: '₪₪₪₪', image: '/images/jewelry/shay.webp', website: '',phone:'04-845-0666' }
  ],
  flowers: [
    { id: 1, name: 'פרחי ספיר ', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/flowers/sapir.webp', website: 'https://www.pirheisapir-greta.com/?gad_source=1&gad_campaignid=18499447892&gbraid=0AAAAABwmJG1a2dtr3TVY6NzDEPoUrjgB6&gclid=Cj0KCAjwv5zEBhBwEi0AOg2YKKoFKPwIyUZOKNffFSMWrgzh9OHPPQZT1P_Gp9w4jPkVZgkpwvMxZh0aAjDuEALw_wcB' },
    { id: 2, name: 'פרחי נופ רוז', location: 'באר שבע', area: 'דרום', price: '₪₪₪₪', image: '/images/flowers/nof.webp', website: 'https://nofarose.co.il/?gad_source=1&gad_campaignid=22122327493&gbraid=0AAAAAqCmuxrIXQ3YowSUFLiNcZhvA1Ars&gclid=Cj0KCAjwv5zEBhBwEi0AOg2YKLHgHNQosXVQkwr0FWh8D8dJRKnrJjEaWYCq_JI3XUCe_31ZXVJuZ0EaAgvaEALw_wcB' },
    { id: 3, name: 'פרחי אלה', location: 'באר שבע', area: 'דרום', price: '₪₪', image: '/images/flowers/ela.webp', website: '',phone:'074-769-1292' },
    { id: 4, name: 'פרחי אדווה ', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/flowers/adva.webp', website: 'https://www.adva-flowers.co.il/' },
    { id: 5, name: 'מיכל פרחים', location: 'נווה צדק', area: 'מרכז', price: '₪₪₪₪', image: '/images/flowers/michal.webp', website: '',phone:'050-573-7991' },
    { id: 6, name: 'פרחי עירית', location: 'פתח תקווה', area: 'מרכז', price: '₪₪₪₪', image: '/images/flowers/irit.webp', website: 'https://www.irit-flowers.co.il/?utm_source=GOOGLE%20MY%20BUSINESS&utm_medium=ORGANIC&utm_campaign=GOOGLE%20MY%20BUSINESS' },
    { id: 7, name: 'פרחי אפריל', location: 'לוד', area: 'מרכז', price: '₪₪₪', image: '/images/flowers/april.webp', website: 'https://april-flowers.co.il/?gad_source=1&gad_campaignid=32177214&gbraid=0AAAAAD7UR4gzp0B2wQMhLssxvjxrUkVAR&gclid=Cj0KCAjwv5zEBhBwEi0AOg2YKLWV2jDNLlEVvbfjQLz9gLFPrbJ4RjTEvgeRsD39SrYR-bl974NktQAaAoP6EALw_wcB' },
    { id: 8, name: 'אמריליס פרחים', location: 'תל אביב', area: 'מרכז', price: '₪₪₪₪', image: '/images/flowers/amarilis.webp', website: 'https://amarilis.biz/category/%D7%96%D7%A8%D7%99-%D7%A4%D7%A8%D7%97%D7%99%D7%9D/?utm_source=GMB' },
    { id: 9, name: 'פרחי בר', location: 'תל אביב יפו', area: 'מרכז', price: '₪₪₪₪', image: '/images/flowers/bar.webp', website: 'https://www.bar-flowers.co.il/' },
    { id: 10, name: 'פרחי הצריף', location: 'חיפה', area: 'צפון', price: '₪₪₪', image: '/images/flowers/zrif.webp', website: 'https://www.fl-hatzrif.co.il/' } 
  ],
  makeup: [
    { id: 1, name: 'עמית חיים', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/makeup/amit.webp', website: 'https://www.amithaimmakeup.com/' },
    { id: 2, name: 'ויקי מנדלבוים', location: 'באר שבע', area: 'דרום', price: '₪₪₪₪', image: '/images/makeup/viki.webp', website: '',phone:'050-791-9198' },
    { id: 3, name: 'מירית גבריאל', location: 'ירושלים', area: 'מרכז', price: '₪₪', image: '/images/makeup/mirit.webp', website: 'https://www.instagram.com/mirit_gavriel_makeup/' },
    { id: 4, name: 'שלי לאון', location: 'ראשון לציון', area: 'מרכז', price: '₪₪₪', image: '/images/makeup/sheli.webp', website: 'https://leons.co.il/' },
    { id: 5, name: 'אלישבע אברהם', location: 'ראש העין', area: 'מרכז', price: '₪₪₪₪', image: '/images/makeup/elisheva.webp', website: 'https://makeupbyelisheva.co.il/' },
    { id: 6, name: 'שיר רדין', location: 'הרצליה', area: 'מרכז', price: '₪₪₪₪', image: '/images/makeup/shir.webp', website: 'https://urbanbridesmag.co.il/%D7%A9%D7%99%D7%A8-%D7%A8%D7%93%D7%99%D7%9F.html' },
    { id: 7, name: 'אוריה', location: 'פתח תקווה', area: 'מרכז', price: '₪₪₪', image: '/images/makeup/oriya.webp', website: 'https://oriyabeauty.wixsite.com/mysite' },
    { id: 8, name: '', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/makeup/.webp', website: '' },
    { id: 9, name: '', location: 'אזור הצפון', area: 'צפון', price: '₪₪₪₪', image: '/images/makeup/.webp', website: '' },
    { id: 10, name: '', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪', image: '/images/makeup/.webp', website: '' }
  ],
};

interface Vendor {
  id: number;
  name: string;
  location: string;
  price: string;
  image: string;
  area: string;
  imageSource?: string;
  website?: string;
  phone?: string;
  averagePrice?: string;
  popularity?: string;
  availability?: string;
  instagram?: string;
}

interface Params {
  params: {
    category: string;
  };
}

const CategoryPage: React.FC<Params> = ({ params }) => {
  const router = useRouter();
  const { category } = params;
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('popularity');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const vendorsPerPage = 10;
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // מוצא את הקטגוריה הנוכחית לפי המזהה
  useEffect(() => {
    const foundCategory = serviceCategories.find(cat => cat.id === category);
    if (foundCategory) {
      setCurrentCategory(foundCategory);
      // בשלב זה נשתמש בספקי דמה - בהמשך יוחלף במידע אמיתי מהשרת
      const categoryVendors = dummyVendors[category as keyof typeof dummyVendors] || [];
      setVendors(categoryVendors);
      setFilteredVendors(categoryVendors);
    } else {
      // אם הקטגוריה לא נמצאה, מעביר בחזרה לדף הספקים הראשי
      router.push('/services');
    }
  }, [category, router]);

  // מפעיל סינון כאשר משתנים הפילטרים
  useEffect(() => {
    let result = [...vendors];
    
    // סינון לפי אזור
    if (areaFilter) {
      result = result.filter(vendor => {
        if (areaFilter === 'center') return vendor.area === 'מרכז';
        if (areaFilter === 'north') return vendor.area === 'צפון';
        if (areaFilter === 'south') return vendor.area === 'דרום';
        if (areaFilter === 'sharon') return vendor.area === 'שרון';
        if (areaFilter === 'jerusalem') return vendor.area === 'ירושלים';
        return true;
      });
    }
    
    // סינון לפי מחיר
    if (priceFilter) {
      result = result.filter(vendor => {
        if (priceFilter === 'low') return vendor.price === '₪' || vendor.price === '₪₪';
        if (priceFilter === 'medium') return vendor.price === '₪₪' || vendor.price === '₪₪₪';
        if (priceFilter === 'high') return vendor.price === '₪₪₪₪';
        return true;
      });
    }
    
    // מיון התוצאות
    if (sortOption === 'price_low') {
      result.sort((a, b) => a.price.length - b.price.length);
    } else if (sortOption === 'price_high') {
      result.sort((a, b) => b.price.length - a.price.length);
    }
    
    setFilteredVendors(result);
  }, [vendors, areaFilter, priceFilter, sortOption]);

  // חישוב מספר עמודים ופיצול הספקים לפי העמוד הנוכחי
  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);
  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstVendor, indexOfLastVendor);

  // מעבר לעמוד הראשון כאשר משתנים הסינונים
  useEffect(() => {
    setCurrentPage(1);
  }, [areaFilter, priceFilter, sortOption]);

  // פונקציה למעבר לעמוד מסוים
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // יצירת מערך של מספרי עמודים לתצוגה
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // אם אין קטגוריה או ספקים, מציג טעינה
  if (!currentCategory || vendors.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>טוען ספקים...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{...styles.header, backgroundColor: currentCategory.bgColor}}>
        <Link href="/services" style={styles.backLink}>
          <i className="fas fa-arrow-right"></i> חזרה לכל הקטגוריות
        </Link>
        <h1 style={styles.title}>{currentCategory.title}</h1>
        <div style={{...styles.titleDecoration, background: `linear-gradient(90deg, ${currentCategory.iconColor}, ${currentCategory.iconColor}cc)`}}></div>
        <p style={styles.headerText}>
          {currentCategory.description}
        </p>
      </div>
      
      <div style={styles.filtersSection}>
        <div style={styles.filterContainer}>
          <label htmlFor="area-filter" style={styles.filterLabel}>סנן לפי:</label>
          <select 
            id="area-filter"
            style={styles.filterSelect}
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="">כל המיקומים</option>
            <option value="center">אזור המרכז</option>
            <option value="north">אזור הצפון</option>
            <option value="south">אזור הדרום</option>
            <option value="sharon">אזור השרון</option>
            <option value="jerusalem">אזור ירושלים</option>
          </select>
          
          <select 
            id="price-filter"
            style={styles.filterSelect}
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option value="">כל טווחי המחירים</option>
            <option value="low">מחיר נמוך (₪)</option>
            <option value="medium">מחיר בינוני (₪₪-₪₪₪)</option>
            <option value="high">מחיר גבוה (₪₪₪₪)</option>
          </select>
        </div>
        
        <div style={styles.sortContainer}>
          <label htmlFor="sort-select" style={styles.filterLabel}>מיון:</label>
          <select 
            id="sort-select"
            style={styles.filterSelect}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="popularity">פופולריות</option>
            <option value="price_low">מחיר - מהנמוך לגבוה</option>
            <option value="price_high">מחיר - מהגבוה לנמוך</option>
            <option value="rating">דירוג</option>
          </select>
        </div>
      </div>
      
      <div style={styles.vendorsGrid}>
        {filteredVendors.length > 0 ? currentVendors.map((vendor) => (
          <motion.div
            key={vendor.id}
            style={styles.vendorCard}
            whileHover={{ 
              y: -10,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={styles.vendorImageContainer}>
              <div 
                style={{
                  ...styles.vendorImage,
                  backgroundImage: `url(${vendor.image})`,
                }}
              >
                <div style={styles.imageBackground}></div>
                {vendor.imageSource && (
                  <div style={styles.imageSourceTag}>
                    <span>{vendor.imageSource}</span>
                  </div>
                )}
                <div style={styles.vendorInfo}>
                  <h3 style={styles.vendorName}>{vendor.name}</h3>
                  <p style={styles.vendorDetails}>
                    <span style={styles.vendorLocation}>
                      <i className="fas fa-map-marker-alt" style={styles.vendorIcon}></i> {vendor.location}
                    </span>
                    <span style={styles.vendorPrice}>
                      <i className="fas fa-shekel-sign" style={styles.vendorIcon}></i> {vendor.price}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div style={styles.vendorActions}>
              {category === 'music' && vendor.instagram ? (
                <a 
                  href={vendor.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...styles.viewDetailsButton,
                    backgroundColor: '#E1306C',
                    color: 'white',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <i className="fab fa-instagram"></i> אינסטגרם
                </a>
              ) : (
                <div style={styles.tooltipContainer}>
                  <button 
                    style={styles.viewDetailsButton}
                    onMouseEnter={() => setActiveTooltip(vendor.id)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <i className="fas fa-info-circle"></i> פרטים נוספים
                  </button>
                  <div style={{
                    ...styles.tooltip,
                    ...(activeTooltip === vendor.id ? styles.tooltipVisible : {})
                  }}>
                    <div style={styles.tooltipContent}>
                      <div style={styles.tooltipItem}>
                        <i className="fas fa-phone" style={{...styles.tooltipIcon, color: currentCategory?.iconColor}}></i>
                        <span>טלפון: {vendor.phone || 'לא זמין'}</span>
                      </div>
                      <div style={styles.tooltipItem}>
                        <i className="fas fa-shekel-sign" style={{...styles.tooltipIcon, color: currentCategory?.iconColor}}></i>
                        <span>מחיר ממוצע: {vendor.averagePrice || 'לא זמין'}</span>
                      </div>
                      <div style={styles.tooltipItem}>
                        <i className="fas fa-star" style={{...styles.tooltipIcon, color: currentCategory?.iconColor}}></i>
                        <span>פופולריות: {vendor.popularity || 'לא זמין'}</span>
                      </div>
                      <div style={styles.tooltipItem}>
                        <i className="fas fa-calendar" style={{...styles.tooltipIcon, color: currentCategory?.iconColor}}></i>
                        <span>זמינות: {vendor.availability || 'לא זמין'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <button style={{...styles.contactVendorButton, backgroundColor: currentCategory.iconColor}}>
                <i className="fas fa-phone-alt"></i> יצירת קשר
              </button>
            </div>
            
            {vendor.website && (
              <div style={styles.websiteButtonContainer}>
                <a 
                  href={vendor.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.websiteButton}
                >
                  <i className="fas fa-globe"></i> לאתר הרשמי
                </a>
              </div>
            )}
          </motion.div>
        )) : (
          <div style={styles.noResults}>
            <i className="fas fa-search" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }}></i>
            <p>לא נמצאו תוצאות התואמות את החיפוש שלך</p>
            <button 
              style={styles.resetFiltersButton}
              onClick={() => {
                setAreaFilter('');
                setPriceFilter('');
                setSortOption('popularity');
              }}
            >
              נקה סינון
            </button>
          </div>
        )}
      </div>
      
      {filteredVendors.length > 0 && totalPages > 1 && (
        <div style={styles.pagination}>
          <button 
            style={styles.paginationButton}
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
          
          {/* תצוגת מספרי עמודים */}
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              style={number === currentPage ? styles.paginationCurrent : styles.paginationButton}
            >
              {number}
            </button>
          ))}
          
          <button 
            style={styles.paginationButton}
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
      )}
      
      {/* אינדיקציה למספר הספקים המוצגים */}
      {filteredVendors.length > 0 && (
        <div style={styles.resultsInfo}>
          מציג {indexOfFirstVendor + 1}-{Math.min(indexOfLastVendor, filteredVendors.length)} מתוך {filteredVendors.length} ספקים
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '100px auto 50px',
    padding: '0 2rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  loadingSpinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderTop: '4px solid #ff4081',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  header: {
    padding: '3rem 2rem',
    borderRadius: '16px',
    marginBottom: '2rem',
    position: 'relative' as const,
    textAlign: 'center' as const,
  },
  backLink: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    color: '#333',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500',
    fontSize: '1rem',
    transition: 'color 0.3s ease',
    ':hover': {
      color: '#ff4081',
    }
  },
  title: {
    fontSize: '3rem',
    color: '#333',
    marginBottom: '1rem',
    fontFamily: 'var(--font-shrikhand), cursive',
  },
  titleDecoration: {
    width: '80px',
    height: '4px',
    margin: '0 auto 1.5rem',
    borderRadius: '2px',
  },
  headerText: {
    fontSize: '1.2rem',
    maxWidth: '700px',
    margin: '0 auto',
    color: '#666',
  },
  filtersSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1rem 0',
    borderBottom: '1px solid #eee',
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  sortContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  filterLabel: {
    fontWeight: '600',
    color: '#334',
  },
  filterSelect: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#333',
    minWidth: '150px',
  },
  vendorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
    padding: '1rem 0 3rem',
  },
  vendorCard: {
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backgroundColor: 'white',
    transition: 'all 0.3s ease',
  },
  vendorImageContainer: {
    height: '200px',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  vendorImage: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage: 'url(/images/dummy/placeholder.jpg)',
  },
  imageBackground: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '70%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
  },
  vendorInfo: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    padding: '1rem',
    color: 'white',
  },
  vendorName: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
  },
  vendorDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
  },
  vendorLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  vendorPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  vendorIcon: {
    fontSize: '0.9rem',
  },
  vendorActions: {
    display: 'flex',
    padding: '1rem',
    borderTop: '1px solid #eee',
    gap: '0.5rem',
  },
  tooltipContainer: {
    position: 'relative' as const,
    flex: 1,
  },
  tooltip: {
    position: 'absolute' as const,
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '250px',
    marginBottom: '10px',
    zIndex: 1000,
    opacity: 0,
    visibility: 'hidden' as const,
    transition: 'all 0.3s ease',
  },
  tooltipVisible: {
    opacity: 1,
    visibility: 'visible' as const,
  },
  tooltipContent: {
    fontSize: '0.9rem',
    color: '#333',
  },
  tooltipItem: {
    margin: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tooltipIcon: {
    width: '20px',
    color: '#666',
  },
  viewDetailsButton: {
    width: '100%',
    padding: '0.6rem',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#e0e0e0',
      '& + div': {
        visibility: 'visible',
        opacity: 1,
      }
    }
  },
  contactVendorButton: {
    flex: 1,
    padding: '0.6rem',
    backgroundColor: '#ff4081',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    ':hover': {
      opacity: 0.9,
    }
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '2rem',
    marginBottom: '3rem',
  },
  paginationButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#333',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    }
  },
  paginationCurrent: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ff4081',
    borderRadius: '4px',
    backgroundColor: '#ff4081',
    color: 'white',
    fontWeight: '600',
  },
  noResults: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center' as const,
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
  },
  resetFiltersButton: {
    marginTop: '1rem',
    padding: '0.6rem 2rem',
    backgroundColor: '#ff4081',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#e0336d',
    }
  },
  resultsInfo: {
    textAlign: 'center' as const,
    color: '#666',
    marginTop: '0.5rem',
    marginBottom: '2rem',
    fontSize: '0.9rem',
  },
  imageSourceTag: {
    position: 'absolute' as const,
    top: '10px',
    left: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    zIndex: 2,
  },
  websiteButtonContainer: {
    padding: '0 1rem 1rem',
    borderTop: '1px solid #eee',
  },
  websiteButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '0.6rem',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    textDecoration: 'none',
    cursor: 'pointer',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    ':hover': {
      backgroundColor: '#c8e6c9',
    }
  },
};

export default CategoryPage; 