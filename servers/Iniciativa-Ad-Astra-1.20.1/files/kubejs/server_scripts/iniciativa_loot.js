// iniciativa_loot.js
//
// Añade botín de progresión (Create + Ad Astra) y BITÁCORAS de lore (libros
// escritos) a los cofres de las estructuras (YUNG's, Towns & Towers).
// Da una razón para explorar las dungeons del pack.
//
// IMPORTANTE de balance: en cofres del OVERWORLD solo se ponen materiales de la
// Tierra (acero, componentes Create). NUNCA desh/ostrum/calorite: esos materiales
// gatean la progresión planeta-a-planeta y deben minarse en su planeta.
//
// API verificada (KubeJS 2001.6.5): ServerEvents.genericLootTables (directorio vacío →
// usa el id COMPLETO tal cual; ojo: chestLootTables antepone "chests/" y rompe estos ids).
// event.modify(id, t => t.addPool(p => ...)); pool.addItem(stack, weight); pool.addEmpty(weight).

// ---- helper: construye una bitácora (written_book) con escapado seguro JS->SNBT->JSON ----
function snbtString(s) {
	// envuelve en comillas simples y escapa \ y ' para SNBT
	return "'" + s.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}
function bitacora(title, paragraphs) {
	// cada página es un componente de texto JSON; JSON.stringify escapa comillas/saltos
	const pages = paragraphs.map(p => snbtString(JSON.stringify({ text: p }))).join(",");
	const nbt = '{title:"' + title.replace(/"/g, '\\"') + '",author:"Iniciativa Ad Astra",resolved:1b,pages:[' + pages + ']}';
	return Item.of("minecraft:written_book", nbt);
}

const BITACORAS = [
	bitacora("Bitácora de campo · Refinería 7", [
		"Refinería 7. Turno de noche.",
		"El crudo del océano ya no da abasto. Dicen que arriba, en las estaciones, queman en una hora lo que nosotros bombeamos en una semana.",
		"Nadie pregunta para qué.",
	]),
	bitacora("Manifiesto de carga", [
		"Cargamento sellado. Destino: tachado.",
		"Firmado por una división que no figura en ningún organigrama.",
		"Una sola instrucción a quien lo transporte: no abrir los contenedores grises.",
	]),
	bitacora("Carta sin enviar", [
		"Si lees esto, llegaste más lejos que yo.",
		"Nos prometieron las estrellas. Nos dieron silencio y un formulario de baja.",
		"No busques a los que partieron a Glacio. Búscalos en los archivos que alguien borró. — M.",
	]),
	bitacora("Protocolo de regreso", [
		"En caso de pérdida de señal con una colonia:",
		"1. No reenviar naves. 2. No responder a su baliza. 3. Marcar el sistema como clausurado.",
		"La Iniciativa cuida de los suyos olvidándolos.",
	]),
];

// ---- tablas objetivo (ids reales de los mods) ----
const COMMON = [
	"betterdungeons:skeleton_dungeon/chests/common",
	"betterdungeons:skeleton_dungeon/chests/middle",
	"betterdungeons:small_dungeon/chests/loot_piles",
	"betterdungeons:small_nether_dungeon/chests/common",
	"betterdungeons:spider_dungeon/chests/egg_room",
	"betterdungeons:zombie_dungeon/chests/common",
	"betterjungletemples:chests/campsite",
	"betterwitchhuts:chests/hut_0",
	"betterdeserttemples:chests/storage",
	"betterdeserttemples:chests/food_storage",
	"betterdeserttemples:chests/pot",
	"betterdeserttemples:chests/wardrobe",
	"betterfortresses:chests/storage",
	"betterfortresses:chests/quarters",
	"betterfortresses:chests/extra",
	"betterfortresses:chests/hall",
	"betterstrongholds:chests/common",
	"betterstrongholds:chests/mess",
	"kaisyn:outpost/common/food",
];
const ADVANCED = [
	"betterstrongholds:chests/treasure",
	"betterstrongholds:chests/armoury",
	"betterstrongholds:chests/grand_library",
	"betterstrongholds:chests/crypt",
	"betterstrongholds:chests/prison_lg",
	"betterdeserttemples:chests/tomb_pharaoh",
	"betterdeserttemples:chests/pharaoh_hidden",
	"betterdeserttemples:chests/lab",
	"betterdeserttemples:chests/statue",
	"betterjungletemples:chests/treasure",
	"betteroceanmonuments:chests/upper_side_chamber",
	"betterfortresses:chests/beacon",
	"betterfortresses:chests/keep",
	"betterfortresses:chests/worship",
	"betterdungeons:zombie_dungeon/chests/special",
	"kaisyn:outpost/common/armory",
];
const BITACORA_CHESTS = [
	"betterstrongholds:chests/grand_library",
	"betterstrongholds:chests/library_md",
	"betterstrongholds:chests/crypt",
	"betterstrongholds:chests/treasure",
	"betterdeserttemples:chests/library",
	"betterdeserttemples:chests/lab",
	"betterdeserttemples:chests/tomb_pharaoh",
	"betterfortresses:chests/worship",
	"betterfortresses:chests/keep",
	"betterdungeons:zombie_dungeon/chests/tombstone",
];

ServerEvents.genericLootTables(event => {
	function applyTo(tables, builderFn) {
		tables.forEach(id => {
			try {
				event.modify(id, table => table.addPool(builderFn));
			} catch (e) {
				console.warn("[iniciativa_loot] no se pudo modificar la tabla " + id + ": " + e);
			}
		});
	}

	// Capa 1 — botín común (Tierra: arranque industrial)
	applyTo(COMMON, pool => {
		pool.setUniformRolls(1, 2);
		pool.addEmpty(25);
		pool.addItem(Item.of("create:andesite_alloy", 6), 20);
		pool.addItem(Item.of("minecraft:iron_ingot", 6), 18);
		pool.addItem(Item.of("create:cogwheel", 8), 16);
		pool.addItem(Item.of("minecraft:copper_ingot", 8), 14);
		pool.addItem(Item.of("create:brass_ingot", 4), 10);
		pool.addItem(Item.of("minecraft:redstone", 12), 10);
		pool.addItem(Item.of("create:electron_tube", 2), 6);
		pool.addItem(Item.of("ad_astra:steel_ingot", 3), 5);
		pool.addItem(Item.of("minecraft:diamond", 2), 3);
	});

	// Capa 2 — botín avanzado (cofres de tesoro / peligro)
	applyTo(ADVANCED, pool => {
		pool.setUniformRolls(1, 2);
		pool.addEmpty(12);
		pool.addItem(Item.of("ad_astra:steel_ingot", 6), 16);
		pool.addItem(Item.of("ad_astra:steel_plate", 4), 12);
		pool.addItem(Item.of("create:precision_mechanism", 3), 12);
		pool.addItem(Item.of("create:electron_tube", 4), 10);
		pool.addItem(Item.of("create:brass_ingot", 8), 10);
		pool.addItem(Item.of("ad_astra:oxygen_gear", 1), 6);
		pool.addItem(Item.of("minecraft:diamond", 4), 6);
		pool.addItem(Item.of("ad_astra:fuel_bucket", 1), 4);
		pool.addItem(Item.of("create:wrench", 1), 3);
	});

	// Capa 3 — bitácoras de lore (raras: alto peso de "nada")
	applyTo(BITACORA_CHESTS, pool => {
		pool.setUniformRolls(1, 1);
		pool.addEmpty(80);
		BITACORAS.forEach(book => pool.addItem(book, 6));
	});
});
