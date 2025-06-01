---
title: "Was ist ein Headless CMS?"
slug: "headless-cms"
publishDate: "2020-02-07"
description: "Simpel gesagt: Ein Headless CMS ist ein CMS ohne die Funktionalität zur Darstellung des Inhalts. Erfahren Sie mehr über die Vorteile, Herausforderungen und Implementierung von Headless CMS."
---

# Was ist ein Headless CMS?

*Published: February 7, 2020*

Simpel gesagt: Ein Headless CMS ist ein CMS ohne die Funktionalität zur Darstellung des Inhalts (abgesehen von der Darstellung im Editoren-Interface). Dies ist aber nur ein Teil der Wahrheit.

![Vergleich zwischen headless und traditioneller CMS bezüglich Trennung der Wiedergabe](/assets/blog/headless-vs-traditional.png)

Während dieser Unterschied dazu führt, dass das CMS den Inhalt über APIs in strukturierten Formaten anbieten muss und dementsprechend eine Wiederverwendung in verschiedensten Kanälen möglich wird, ist die andere damit einhergehende Änderung viel bedeutender. Und zwar führt die Loslösung vom Layout im CMS dazu, dass sich die Datenstruktur von «Seiten» und «Komponenten» lösen kann. Der Fokus wird stärker auf den eigentlichen Inhalt und dessen Struktur gelegt. Wohlverstanden, viele «traditionelle» CMS erlauben das auch, aber bei Headless CMS ist es die Grundannahme.

Dies hat einige Auswirklungen:

• Fokus auf Inhalte und nicht auf Seiten
• Kanal-Unabhängige Inhalte
• Kein WYSIWYG Editieren (zumindest bei fast allen Headless CMS nicht)
• Keine implizite Navigation (diese würde ja jeweils wieder nur für die Webseite funktionieren)

Gleichwohl werden die meisten Headless CMS Projekte einen oder mehrere «Seiten»-Inhaltstypen haben. Der meiste Inhalt sollte aber nicht in diesen Seiten liegen, sondern nur von der Seite angezogen werden. Der Inhalt kann also auch ohne Seite funktionieren (ein Chatbot, der FAQs beantwortet, sollte keine Links auf Seiten, sondern den Antwort-Text liefern).

## Warum ist Headless jetzt in aller Munde?

Headless CMS gibt es schon seit geraumer Zeit – und einige «traditionelle» CMS unterstützen Headless Funktionalität seit vielen Jahren. Das Thema nahm aber erst in den letzten Jahren richtig an Fahrt auf. Dies liegt wohl vor allem an folgenden Punkten:

• Die Multichannel-Wiederverwendung von Inhalten nimmt zu
• Content Marketing gewann stark an Bedeutung – da hier viel Geld in Inhalte investiert wird, ist eine Wiederverwendung wichtiger denn je
• Die unabhängige Implementierung des Web-Channels wurde mit Verwendung von Frontend-Technologien (z.B. React mit Next.js) einfacher
• Die Anzahl interaktiver Elemente auf Webseiten nahm zu – diese Komponenten sind sehr oft auf strukturierte Daten angewiesen und können mit «Seiten» nicht viel anfangen
• Mit responsiven Layouts mussten sich Editoren schon länger davon lösen, das Aussehen einer Seite genau definieren zu können

## Was bedeutet das für Editoren und Marketing-Verantwortliche?

Für alle, die bisher mit «traditionellen» CMS gearbeitet haben, ist es wichtig die Änderungen genau zu verstehen und auch die Gründe und Vorteile, welche sich daraus ergeben, zu kennen. Nur so wird man über das anfängliche «ich kann die Seite gar nicht direkt editieren» hinwegkommen. Wenn das aber geschafft ist, wird auch für Editoren die Arbeit einfacher. Sie müssen sich nicht (oder nur beschränkt) um Komposition kümmern und können die Inhalte in genau den Strukturen abfüllen, welche dafür konzipiert wurden. Jeder Konsument der Inhalte ist dann verantwortlich für eine dem Kanal angepasste Darstellung.

## Was bedeutet das für die Entwicklung?

Das CMS ist nicht mehr länger die Basis der Entwicklung. Die Wahl der verwendeten Frameworks und der Programmiersprache ist offen. Dies gibt viel Freiheit und ermöglicht die sinnvolle Nutzung von vorhandenem Wissen oder zum Teil sogar von bereits programmierten Artefakten (Styleguides, die z.B. auf React-Komponenten basieren können sehr leicht für das Rendering dieser Komponenten verwendet werden).

Auf der anderen Seite bedeutet dies auch, dass man auf einiges verzichten muss, was CMS bisher mitgebracht haben:

• Authentifizierung / Berechtigungen
• Session Management
• Personalisierung / A/B-Testing
• Navigations-Aufbau
• …

Für diese Funktionalitäten gibt es wiederum Services, welche man kaufen kann. Aber selbst, wenn man einen solchen Service zuzieht muss die Integration selbst entwickelt werden. Dies bedeutet initial einen Mehraufwand – im Idealfall spart man sich diesen Aufwand aber an anderer Stelle wieder ein – und kann die Funktionalitäten in anderen Projekten wiederverwenden.

## Integrationen

Heute gibt es kaum mehr ein Web-Projekt, welches nicht davon lebt, dass es eine oder mehrere Integrationen in Backend-Systeme zur Verfügung stellt und dem Benutzer damit Zugang zu den verschiedensten Self-Service-Funktionen ermöglicht. Sehr oft wird das CMS als Platform für diese Integrationen verwendet. Dies ist hier nicht mehr möglich. Es gibt prinzipiell zwei Varianten, wie man damit umgehen kann.

### Integration über den Browser

Bei diesem Ansatz liefert der Server nur das «Gerüst» der Seite bzw. alle Inhalte, welche nicht aus dem Backend-System kommen. Der Browser lädt danach die Informationen direkt via API vom Backend-System nach. In Praxis wird hier fast immer noch ein weiterer Layer dazwischenstehen – aus Sicherheitsgründen und/oder um die Daten in eine Struktur zu bringen, welche für die Webapplikation sinnvoll ist.

Diese Integration bewährt sich vor allem, wenn eine Authentifizierung gegenüber dem Backend-System notwendig ist. Dabei muss nur der Browser das entsprechende Token besitzen (nach einem Login via [Federated Authentication](https://dev-blog.viu.ch/federated-authentication)) und kann dieses dann für den Zugriff auf diverse Systeme und Daten verwenden.

![Bild welches server-side Rendering und client-side Rendering in Kombination darstellt](/assets/blog/csr.png)

### Integration über die Rendering-Applikation

Sollten Daten integriert werden, welche unbedingt auch von Suchmaschinen indexiert werden sollen und dementsprechend öffentlich sind, macht eine Integration innerhalb der Rendering-Applikation für den Web-Kanal Sinn. Damit können diese Inhalte auf dem Server gerendert werden und eine Suchmaschine kann das fertige HTML lesen und indexieren. Dies ist übrigens auch einer der wichtigsten Gründe, weshalb Server-Side-Rendering (SSR) für so viele Inhalte wie möglich zur Verfügung stehen sollte.

![Bild welches server-side Rendering von verschiedenen Inhalten darstellt](/assets/blog/ssr.png)

## Anbieter und Tools

Wir haben uns im Laufe der Zeit diverse Headless CMS angeschaut und diese auch teilweise ausprobiert. Dies soll aber kein Review der Anbieter werden. Wichtig ist bei der Auswahl auf jeden Fall, dass man sich (unter anderem) folgende Punkte anschaut:

• **Preis**: Es gibt alles von gratis Systemen bis zu relativ teuren SaaS Angeboten.
• **Interface / Usability**: Die Systeme unterscheiden sich stark in der Übersichtlichkeit, Geschwindigkeit und allgemeinen Editoren-Usability.
• **«Template»-Vererbung/Wiederverwendung**: Welche Flexibilität man beim Aufbau der Inhaltstypen hat beeinflusst die «technische Sauberkeit» der Lösung oft stark und kann auch das Editieren vereinfachen oder unnötig komplex machen.
• **SDKs / Dokumentation**: Für den Bau der Webseite oder anderer Kanäle stehen oft SDKs für verschiedene Programmiersprachen zur Verfügung. Wichtig ist die Qualität des SDKs da dadurch der Aufwand der Implementierung von Lösungen stark beeinflusst wird. Wichtig ist auch, dass die Dokumentation komplett ist und man vom Anbieter guten Support erhält.
• **Performance & Stabilität**: Da viele Systeme von einem Headless CMS abhängig sein können, machen sich Probleme mit dem Headless CMS auch an vielen Stellen bemerkbar und viele Applikationen können dadurch ausgebremst werden.

## Sitecore und Headless

Als langjähriger Sitecore Entwickler möchte ich natürlich auch erwähnt haben, dass sich Sitecore auch sehr gut als Headless CMS eignet. Es bringt (schon lange) die wichtigsten Features eines Headless CMS mit.

• Freie Definition der Datenstrukturen
• API-Zugriff auf alle Inhalte

Was bis 2017 gefehlt hatte war eine SDK für die Verwendung in den bekanntesten Frontend Frameworks. Dies wurde mit JSS ([https://jss.sitecore.com/](https://jss.sitecore.com/)) aber eingeführt.

Zusätzlich zu den Funktionen eines Headless CMS bietet Sitecore auch Funktionen an, die man sich aus einem Enterprise CMS gewohnt ist, welche aber reine Headless-CMS meist nicht anbieten:

• Authentifizierung / Autorisierung
• Baumstruktur der Inhalte
• Flexible Layouts (falls man die Seiten-Komposition den Editoren überlassen möchte)
• Personalisierung / A/B-Testing
• Analytics
• u.v.m.

Sitecore hat im letzten Jahr klar kommuniziert, dass man in Zukunft (auch) auf SaaS-Angebote ([https://www.sitecore.com/company/news-events/press-releases/2019/11/sitecore-saas-strategy/saas-faq](https://www.sitecore.com/company/news-events/press-releases/2019/11/sitecore-saas-strategy/saas-faq)) setzen wird. Man darf also gespannt sein, ob dies auch ein reines Headless Angebot wird (da dies verhindern würde, dass Sitecore Lösungen betreuen muss, welche Code von Dritten enthält). Mitte 2020 wird man hier wohl genaueres wissen.

## Progressive Decoupling

Bei neuen Projekten stellt sich initial die Frage, ob ein Headless CMS oder ein eher traditioneller Ansatz gewählt werden soll. Viel häufiger (zumindest bei unseren Kunden) werden sowieso bereits beide Ansätze parallel eingesetzt. Meist gibt es ein «traditionelles» CMS, welches auch die meisten Seiten «produziert» und gleichzeitig via APIs Inhalte für Applikationen (Single Page Applications oder auch integrierte Komponenten) liefert.

Es ist also möglich die Vorteile beider Ansätze gleichzeitig zu nutzen – und damit natürlich auch einen Wechsel von traditionell zu headless schrittweise anzugehen. Dies kann insbesondere bei grossen und schon in die Jahre gekommenen Lösungen ein sinnvolles Vorgehen sein, um eine Modernisierung zu erreichen. Dabei fokussiert man am Anfang vor allem auf Inhalte und Daten, welche sich einfach strukturieren lassen (wie z.B. News, Blogs, Veranstaltungen, …) und bereits in anderen Kanälen benötigt werden.
