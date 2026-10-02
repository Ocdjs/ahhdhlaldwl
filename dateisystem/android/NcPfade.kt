package de.notuebernachtung.daten.dateien

import java.security.SecureRandom
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.YearMonth
import java.time.format.DateTimeFormatter

/**
 * Pfade im Nextcloud-Ordner „Notuebernachtung/“ und im lokalen Spiegel (files/nextcloud/Notuebernachtung/).
 * Alle Pfade sind relativ zur Wurzel und gelten auf beiden Seiten gleich. Siehe dateisystem/README.md.
 */
object NcPfade {
    const val WURZEL = "Notuebernachtung"

    private val TAG = DateTimeFormatter.ISO_LOCAL_DATE                       // 2026-10-02
    private val ZEIT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH-mm-ss") // 2026-10-02T21-14-05
    private fun monat(d: LocalDate) = YearMonth.from(d).toString()           // 2026-10

    // _app
    const val VERSION = "_app/version.json"
    fun geraet(geraetId: String) = "_app/Geraete/$geraetId.json"
    fun protokoll(tag: LocalDate, geraetId: String) = "_app/Protokoll/${monat(tag)}/${tag.format(TAG)}_$geraetId.jsonl"

    // Einstellungen (Admin-PIN)
    const val HAUS = "Einstellungen/Haus.json"
    const val GRUNDRISS_PIUS = "Einstellungen/Grundriss_St-Pius.json"
    const val GRUNDRISS_NIKOLAUS = "Einstellungen/Grundriss_St-Nikolaus.json"
    const val APP = "Einstellungen/App.json"
    const val TEAM = "Einstellungen/Team.json"
    fun hausordnung(sprache: String) = "Einstellungen/Texte/Hausordnung/$sprache.md"
    const val DATENSCHUTZ = "Einstellungen/Texte/Datenschutz/de.md"

    // Gäste: Ordner nur mit ID, nie mit Namen
    fun gastOrdner(gastId: String) = "Gaeste/$gastId"
    fun gast(gastId: String) = "${gastOrdner(gastId)}/Gast.json"
    fun gastDokument(gastId: String, datei: String) = "${gastOrdner(gastId)}/Dokumente/${ascii(datei)}"
    fun gastUnterschrift(gastId: String, tag: LocalDate, dokument: String, wer: String) =
        "${gastOrdner(gastId)}/Unterschriften/${tag.format(TAG)}_${dokument}_$wer.png"   // dokument: Hausordnung|Datenschutz, wer: Gast|Betreuung
    fun ereignis(gastId: String, um: LocalDateTime, von: String, art: EreignisArt) =
        "${gastOrdner(gastId)}/Ereignisse/${um.format(ZEIT)}_${ascii(von)}_${art.name.lowercase()}.json"
    enum class EreignisArt { SANKTION, NOTIZ }

    /** Aufnahme-PDF: 0042_Max_Mustermann_2026-11-14.pdf (ohne Nachname ohne diesen Teil). */
    fun aufnahmePdfName(aufnahmeNr: String, vorname: String, nachname: String?, tag: LocalDate) =
        ascii(listOfNotNull(aufnahmeNr.takeLast(4), vorname, nachname?.takeIf { it.isNotBlank() }, tag.format(TAG)).joinToString("_")) + ".pdf"

    // Diensttag
    fun belegung(tag: LocalDate) = "Belegung/${monat(tag)}/${tag.format(TAG)}.json"
    fun duschplan(tag: LocalDate) = "Duschplan/${monat(tag)}/${tag.format(TAG)}.json"

    // Berichte
    fun berichtOrdner(tag: LocalDate) = "Berichte/${monat(tag)}/${tag.format(TAG)}"
    fun bericht(tag: LocalDate) = "${berichtOrdner(tag)}/Bericht.json"
    fun berichtPdf(tag: LocalDate) = "${berichtOrdner(tag)}/${tag.format(TAG)}_Dienstbericht.pdf"
    fun berichtUnterschrift(tag: LocalDate, rolle: String, person: String) =
        "${berichtOrdner(tag)}/Unterschriften/${ascii(rolle.replace(' ', '-'))}_${ascii(person)}.png"
    fun nachtrag(tag: LocalDate, um: LocalDateTime, von: String) = "${berichtOrdner(tag)}/Nachtraege/${um.format(ZEIT)}_${ascii(von)}.json"
    fun kommentar(tag: LocalDate, um: LocalDateTime, von: String) = "${berichtOrdner(tag)}/Kommentare/${um.format(ZEIT)}_${ascii(von)}.json"
    fun fehltErledigt(monat: YearMonth) = "Berichte/$monat/Fehlt_erledigt.json"

    // Hinweise
    fun hinweis(um: LocalDateTime, von: String) = "Hinweise/${monat(um.toLocalDate())}/${um.format(ZEIT)}_${ascii(von)}.json"
    const val HINWEIS_EINGANG = "Hinweise/Eingang"
    const val HINWEIS_UEBERNOMMEN = "Hinweise/Eingang/Uebernommen"

    // Kalender
    fun dienstplan(monat: YearMonth) = "Kalender/Dienstplan/$monat.json"
    fun termine(monat: YearMonth) = "Kalender/Termine/$monat.json"
    fun kalenderAenderung(betrifft: LocalDate, um: LocalDateTime, von: String) =
        "Kalender/Aenderungen/${monat(betrifft)}/${um.format(ZEIT)}_${ascii(von)}.json"
    const val DIENSTPLAN_EINGANG = "Kalender/Dienstplan-Eingang"
    const val DIENSTPLAN_EINGELESEN = "Kalender/Dienstplan-Eingang/Eingelesen"

    // Monatsabschluss
    enum class Bereich(val ordner: String) { BETREUUNG("Betreuung"), KUECHE("Kueche") }
    fun plan0(monat: YearMonth) = "Monatsabschluss/$monat/Plan0.json"
    fun plankorrektur(monat: YearMonth, um: LocalDateTime, von: String, person: String, bereich: Bereich) =
        "Monatsabschluss/$monat/Plankorrekturen/${um.format(ZEIT)}_${ascii(von)}_${ascii(person)}-${bereich.ordner}.json"
    fun dienstnachweis(monat: YearMonth, bereich: Bereich, person: String, endung: String) =
        "Monatsabschluss/$monat/${bereich.ordner}/${monat}_Dienstnachweis_${bereich.ordner}_${ascii(person)}.$endung"   // json | pdf | png
    fun lohnabrechnung(monat: YearMonth, bereich: Bereich) = "Monatsabschluss/$monat/Lohnabrechnung_${monat}_${bereich.ordner}.csv"

    // Auswertung
    fun auswertungBelegung(monat: YearMonth) = "Auswertung/Belegung_$monat.csv"

    /** Ordner, die beim Abgleich zuerst per PROPFIND geprüft werden (Rest nur, wenn der Wurzel-ETag sich ändert). */
    fun heisseOrdner(heute: LocalDate): List<String> = listOf(
        "Belegung/${monat(heute)}", "Duschplan/${monat(heute)}", "Berichte/${monat(heute)}",
        "Hinweise/${monat(heute)}", HINWEIS_EINGANG, "Kalender/Dienstplan", "Kalender/Termine", DIENSTPLAN_EINGANG,
        "Monatsabschluss/${monat(heute)}", "Monatsabschluss/${monat(heute.minusMonths(1))}", "Einstellungen",
    )

    /** Neue Gast-ID: g- und 8 Zeichen Base32 (a–z, 2–7), zufällig. */
    fun neueGastId(zufall: SecureRandom = SecureRandom()): String {
        val zeichen = "abcdefghijklmnopqrstuvwxyz234567"
        return "g-" + (1..8).map { zeichen[zufall.nextInt(zeichen.length)] }.joinToString("")
    }

    /** Dateinamen nur aus ASCII-Buchstaben, Ziffern, . _ - (Umlaute ersetzt, Leerzeichen → _). */
    fun ascii(text: String): String = text
        .replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
        .replace("Ä", "Ae").replace("Ö", "Oe").replace("Ü", "Ue").replace("ß", "ss")
        .replace(Regex("[^A-Za-z0-9._-]+"), "_").trim('_')
}

/** Wie eine Datei hochgeladen und bei Konflikt abgeglichen wird. */
enum class Abgleich {
    /** Einmal anlegen mit If-None-Match: *, danach nie ändern (Sanktion, Notiz, Nachtrag, Kommentar, Plan0, Dienstnachweis …). */
    UNVERAENDERLICH,
    /** If-Match auf das ETag der Basis; bei 412 Drei-Wege-Abgleich je Feld bzw. je Eintrag. */
    AENDERBAR,
    /** Aus Quelldateien neu erzeugen und überschreiben (PDF, Lohnabrechnung, Auswertung). */
    ABGELEITET,
    /** Nur dieses Gerät schreibt die Datei (Protokoll, Gerätedatei). */
    EIGENES_GERAET,
}

/** Zuordnung Pfad → Regel, gleiche Reihenfolge wie in pruefen.py. */
fun abgleichFuer(pfad: String): Abgleich = when {
    pfad.startsWith("_app/") -> Abgleich.EIGENES_GERAET
    "_Dienstnachweis_" in pfad -> Abgleich.UNVERAENDERLICH            // auch das PDF: nach der Unterschrift nie neu erzeugen
    pfad.endsWith(".pdf") || pfad.endsWith(".csv") -> Abgleich.ABGELEITET
    "/Ereignisse/" in pfad || "/Nachtraege/" in pfad || "/Kommentare/" in pfad || "/Unterschriften/" in pfad ||
        pfad.startsWith("Kalender/Aenderungen/") || "/Plankorrekturen/" in pfad || pfad.endsWith("/Plan0.json") -> Abgleich.UNVERAENDERLICH
    else -> Abgleich.AENDERBAR   // Bericht.json wird beim Abschließen zusätzlich gesperrt (status = abgeschlossen)
}
