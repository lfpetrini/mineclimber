// ITEMS

function ItemTemplate() {
	this.name = "Item";
	this.description = "An item.";
	this.owner = null;
	this.icon = null;
	this.isConsumable = false;
	this.sellingPrice = 0;
	this.buyingPrice = 0;
}

ItemTemplate.prototype.action = null; //new function(item) { }

// Should return a new instance of the collectable item referent to this inventory item
// So we can realease it to the wild again :)
ItemTemplate.prototype.createCollectable = new function(availableTime) {
}

function Weapon() {
	this.attack = 0;
}

Weapon.prototype = new ItemTemplate();

function Shield() {
	this.defense = 0;
}

Shield.prototype = new ItemTemplate();

// We can save memory this way
// Any virtual item in the inventory will point to one single item template
function Item(itemTemplate, owner) {
	this.template = itemTemplate;
	this.owner = owner;
}

/*
function copyItem(item) {
	var tempItem;
	
	if(item instanceof Weapon) {
		tempItem = new Weapon();
		tempItem.attack = item.attack;
	}
	else if(item instanceof Shield) {
		tempItem = new Shield();
		tempItem.defense = item.defense;
	}
	else if(item instanceof Item) {
		tempItem = new Item();
	}
	else
		return null;

	tempItem.action = item.action;
	tempItem.name = item.name;
	tempItem.description = item.description;
	tempItem.icon = item.icon;
	tempItem.owner = item.owner;
	tempItem.sellingPrice = item.sellingPrice;
	tempItem.buyingPrice = item.buyingPrice;
	
	return tempItem;
}
*/

// ItemRepository

function ItemRepository() {
	this.items = {};
}

ItemRepository.prototype.add = function(id, item) {
	this.items[id] = item;
}

ItemRepository.prototype.get = function(id) {
	return this.items[id];
}