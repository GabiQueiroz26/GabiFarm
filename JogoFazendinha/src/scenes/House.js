import { Scene } from "phaser";
import { CONFIG } from "../config";
import Player from "../entities/Player";
import Touch from "../entities/Touch";
import Farm from "./Farm";

export default class House extends Scene {


    /**@type {Phaser.Tilemaps.Tilemap} */
    map;

    layers = {};

    /** @type {Player} */
    player;

    touch;

    /** @type {Phaser.Physics.Arcade.Group} */
    groupObjects;


    isTouching = false;

  
    


    constructor() {
        super('House'); // Salvando o nome desta Cena
    }

    preload() {
        // Carregar os dados do mapa
        this.load.tilemapTiledJSON('casaMapa', 'mapas/CasinhaMap.json');

        // Carregar os tilesets do map (as imagens)
        this.load.image('MapaGeral', 'mapas/tiles/geral.png');


        //Importando um spritesheet
        this.load.spritesheet('player', 'mapas/tiles/player.png', {
            frameWidth: 48,
            frameHeight: 48
        })

        
    }

    create(){

        this.cursors = this.input.keyboard.createCursorKeys();
        this.createMap();
        this.createLayers();
        this.createPlayer();
        this.createObjects();
        this.createColliders();
        this.createCamera();


    }

    update(){
    }

    createPlayer() {
        this.touch = new Touch(this, 16*12, 16*10);

        this.player = new Player(this, 16*12, 16*10, this.touch);
        this.player.setDepth( 5 );
       
    }

    createMap() {
        this.map = this.make.tilemap({
            key: 'casaMapa',
            tileWidth: CONFIG.TILE_SIZE,
            tileHeight: CONFIG.TILE_SIZE
        });

        //Fazendo a correspondencia entre as imagens usadas no Tiled
        // e as carregadas pelo Phaser
        this.map.addTilesetImage('geral', 'MapaGeral');

    }

    // Automatizando
    createLayers() {
           //Pegando os tilesets (usar os nomes do Tiled)
           const tilesHouse = this.map.getTileset('geral');

           const layerNames = this.map.getTileLayerNames();
           for (let i = 0; i < layerNames.length; i++) {
               const name = layerNames[i];
   
               this.layers[name] = this.map.createLayer(name, [tilesHouse], 0, 0);
               // Definindo a profundidade  de cada camada
               this.layers[name].setDepth( i );
   
               // Verificando se o layer possui colisão
               if ( name.endsWith('Collision') ) {
                   this.layers[name].setCollisionByProperty({ collider: true });
   
                   if ( CONFIG.DEBUG_COLLISION ) {
                       const debugGraphics = this.add.graphics().setAlpha(0.75).setDepth(i);
                       this.layers[name].renderDebug(debugGraphics, {
                           tileColor: null, // Color of non-colliding tiles
                           collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
                           faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
                       });
                   }
               }
           }
    }

    createObjects() {
         // Criar um grupo para os objetos
         this.groupObjects = this.physics.add.group();

         const objects = this.map.createFromObjects( "objetos",  {
             name: "porta",
         
         });

         
 
         // Tornando todos os objetos, Sprites com Physics (que possuem body)
         this.physics.world.enable(objects);
 
         for(let i = 0; i < objects.length; i++){
             //Pegando o objeto atual
             const obj = objects[i];
             //Pegando as informações do Objeto definidas no Tiled
             const prop = this.map.objects[0].objects[i];
             
 
             obj.setDepth(this.layers.length + 1);
             obj.setVisible(false);
             obj.prop = this.map.objects[0].objects[i].properties;
 
             console.log(obj.x, obj.y);
 
             this.groupObjects.add(obj);
         }
    }


    createCamera() {
        const mapWidht = this.map.width * CONFIG.TILE_SIZE;
        const mapHeight = this.map.height * CONFIG.TILE_SIZE;

        this.cameras.main.setBounds(0,0, mapWidht, mapHeight);
        this.cameras.main.startFollow(this.player);
    }

    createColliders() {
      
        // Criando colisão entre o player e as camadas de colisão do Tiled
        const layerNames = this.map.getTileLayerNames();
        for (let i = 0; i < layerNames.length; i++) {
            const name = layerNames[i];

            if( name.endsWith('Collision')) {
                this.physics.add.collider(this.player, this.layers[name]);
            }
            
        }

    
        // Chama a função this.handleTouch toda vez que o this.touch entrar em contato com um objeto do this.groupObjects
        this.physics.add.overlap(this.touch, this.groupObjects, this.handleTouch, undefined, this);
    }

    handleTouch(touch, object) {
        const { space } = this.cursors; 
        if (this.isTouching && this.player.isAction) {
          return;
        }
    
        if (this.isTouching && !this.player.isAction) {
          this.isTouching = false;
          return;
        }

    
        if(space.isDown){
            if(object.name == "porta"){
                this.scene.switch('Farm');
            }
        }
    }
    
}