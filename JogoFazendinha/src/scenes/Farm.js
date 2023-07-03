import { Scene } from "phaser";
import { CONFIG } from "../config";
import Player from "../entities/Player";
import Touch from "../entities/Touch";
import House from "./House";

export default class Farm extends Scene {


    /**@type {Phaser.Tilemaps.Tilemap} */
    map;

    layers = {};

    /** @type {Player} */
    player;

    touch;

    /** @type {Phaser.Physics.Arcade.Group} */
    groupObjects;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    cowBrown;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    cowGreen;

     /** @type {Phaser.Physics.Arcade.Sprite} */
     cow;

    isTouching = false;


  
    


    constructor() {
        super('Farm'); // Salvando o nome desta Cena
    }

    preload() {
        // Carregar os dados do mapa
        this.load.tilemapTiledJSON('fazendaMapa', 'mapas/fazendinhaMap.json');

        // Carregar os tilesets do map (as imagens)
        this.load.image('MapaGeral', 'mapas/tiles/geral.png');


        //Importando um spritesheet
        this.load.spritesheet('player', 'mapas/tiles/player.png', {
            frameWidth: 48,
            frameHeight: 48
        })
    
        this.load.spritesheet('cow', 'mapas/tiles/vacas_anim.png', {
            frameWidth: CONFIG.TILE_SIZE * 2,
            frameHeight: CONFIG.TILE_SIZE * 2
        })

        this.load.spritesheet('geral', 'mapas/tiles/geral.png', {
            frameWidth: 16,
            frameHeight: 16
        })


        this.load.spritesheet('arvoreMaca', 'mapas/tiles/arvore_macas_anim.png', {
            frameWidth: 48,
            frameHeight: 48
        })

        


        
    }

    create(){

        this.cursors = this.input.keyboard.createCursorKeys();
        this.createMap();
        this.createLayers();
        this.createPlayer();
        this.createCows();
        this.createObjects();
        this.createAnimArvore();
        this.createHUD(); // Chamando a função para criar o HUD
        this.createColliders();
        this.createCamera();


    }

    update(){
    }

    createPlayer() {
        this.touch = new Touch(this, 16*12, 16*10);

        this.player = new Player(this, 16*12, 16*14, this.touch);
        this.player.setDepth( 5 );
       
    }

    createMap() {
        this.map = this.make.tilemap({
            key: 'fazendaMapa',
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
           const tilesFarm = this.map.getTileset('geral');

           const layerNames = this.map.getTileLayerNames();
           for (let i = 0; i < layerNames.length; i++) {
               const name = layerNames[i];
   
               this.layers[name] = this.map.createLayer(name, [tilesFarm], 0, 0);
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

         const objects = this.map.createFromObjects( "objetos", "objetos", "objetos",  {
             name: "sementeCenoura", name: "sementeRepolho", name: "sementeRabanete", name: "sementeMaca",  name: "Cenoura", name: "Repolho", name: "Rabanete", name: "arvoreMaca", name: "porta"
         
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
                this.physics.add.collider(this.cowBrown, this.layers[name]);
                this.physics.add.collider(this.cowGreen, this.layers[name]);
            }
            
        }

    
        // Chama a função this.handleTouch toda vez que o this.touch entrar em contato com um objeto do this.groupObjects
        this.physics.add.overlap(this.touch, this.groupObjects, this.handleTouch, undefined, this);
    }

    createCows() {
        this.cowBrown = this.physics.add.sprite(CONFIG.TILE_SIZE * 20, 17* CONFIG.TILE_SIZE, 'cow').setOrigin(0,1).setDepth(this.layers.length + 1).setFrame(0);
        this.cowBrown.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('cow', {
                start: 0, end: 2 }),
                frameRate: 6,
                repeat: -1
        });
        this.cowBrown.play('idle')


        this.cowBrown.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('cow', {
                start: 9, end: 16 }),
                frameRate: 6,
                repeat: -1,
                
        })
        this.cowBrown.play('walk')
        this.cowBrown.setVelocityX(7)
        this.cowBrown.flipX = false;



        this.cowGreen = this.physics.add.sprite(CONFIG.TILE_SIZE * 16, 10 * CONFIG.TILE_SIZE, 'cow', 0).setOrigin(0,1).setDepth(this.layers.length - 1).setFrame(64);
        this.cowGreen.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('cow', {
                start: 64, end: 66 }),
                frameRate: 6,
                repeat: -1
        });

        this.cowGreen.play('idle')

        this.cowGreen.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('cow', {
                start: 72, end: 80 }),
                frameRate: 6,
                repeat: -1
        })
        this.cowGreen.play('walk')

        this.cowGreen.setVelocityX(8)
        this.cowGreen.flipX = false;
        
        this.time.addEvent({
            delay: 10, // Intervalo de tempo entre cada verificação 
            loop: true,
            callback: () => {
                if (this.cowBrown.body.blocked.right) {
                    this.cowBrown.setVelocityX(-7);
                    this.cowBrown.flipX = true; // Vira a vaca marrom para a esquerda
                } else if (this.cowBrown.body.blocked.left) {
                    this.cowBrown.setVelocityX(7);
                    this.cowBrown.flipX = false; // Vira a vaca marrom para a direita
                }
    
                if (this.cowGreen.body.blocked.right) {
                    this.cowGreen.setVelocityX(-8);
                    this.cowGreen.flipX = true; // Vira a vaca verde para a esquerda
                } else if (this.cowGreen.body.blocked.left) {
                    this.cowGreen.setVelocityX(8);
                    this.cowGreen.flipX = false; // Vira a vaca verde para a direita
                }
            }
        });

       
 
        
       
        
        
        
    }
 

    

    handleTouch(touch, object) {
  
        const { space } = this.cursors;  

        
    
        if(this.isTouching && this.player.isAction){
            return;
        }

        if (this.isTouching && !this.player.isAction){
            this.isTouching = false;
            return;
        }

    
        if (space.isDown ) {
            if(object.name == "porta"){
              this.scene.switch('House')
            }
        }

        if(this.player.isAction) {
            this.isTouching = true;
            if(object.name == "sementeCenoura"){

                if (this.player.body.enable == true && !object.isTouched ) {
                    
                    var semente1 = this.add.sprite(250, 335, 'geral', 584);
                    var semente1 = this.add.sprite(290, 335, 'geral', 584);
                    var semente1 = this.add.sprite(330, 335, 'geral', 584);
                    var semente1 = this.add.sprite(370, 335, 'geral', 584);
                    var semente1 = this.add.sprite(410, 335, 'geral', 584);
                    var semente1 = this.add.sprite(450, 335, 'geral', 584);
                
                    
                    console.log("adicionando semente");
                    object.isTouched = true;
                    
              }  
              
            } 

            if(object.name == "sementeRepolho"){

                if (this.player.body.enable == true && !object.isTouched) {
                    var semente2 = this.add.sprite(250, 365, 'geral', 608);
                    var semente2 = this.add.sprite(290, 365, 'geral', 608);
                    var semente2 = this.add.sprite(330, 365, 'geral', 608);
                    var semente2 = this.add.sprite(370, 365, 'geral', 608);
                    var semente2 = this.add.sprite(410, 365, 'geral', 608);
                    var semente2 = this.add.sprite(450, 365, 'geral', 608);
                    console.log("adicionando semente");
                    object.isTouched = true;
                    
              }  
              
            }

            if(object.name == "sementeRabanete"){

                if (this.player.body.enable == true && !object.isTouched) {


                    var semente3 = this.add.sprite(250, 394, 'geral', 824);
                    var semente3 = this.add.sprite(290, 394, 'geral', 824);
                    var semente3 = this.add.sprite(330, 394, 'geral', 824);
                    var semente3 = this.add.sprite(370, 394, 'geral', 824);
                    var semente3 = this.add.sprite(410, 394, 'geral', 824);
                    var semente3 = this.add.sprite(450, 394, 'geral', 824);

                    object.isTouched = true;
                    console.log("adicionando semente");
                
              }  
              
            }
        
                 
                if (object.name == "Cenoura") {
           
            
                    this.player.setFrame(133, 146)

            

                        if ( space.isDown) {
                            

                            if (!this.secondStageActivated) {
                                setTimeout(() => {
                                        var estagio2 = this.add.sprite(250, 335, 'geral', 585);
                                        var estagio2 = this.add.sprite(290, 335, 'geral', 585);
                                        var estagio2 = this.add.sprite(330, 335, 'geral', 585);
                                        var estagio2 = this.add.sprite(370, 335, 'geral', 585);
                                        var estagio2 = this.add.sprite(410, 335, 'geral', 585);
                                        var estagio2 = this.add.sprite(450, 335, 'geral', 585);
                                    

                                        console.log("estagio 2");
                                        this.secondStageActivated = true
                                }, 60000)
                            } else if(!this.thirdStageActivated) {
                                    setTimeout(() => {       
                                      

                                        var estagio3 = this.add.sprite(250, 335, 'geral', 586);
                                        var estagio3 = this.add.sprite(290, 335, 'geral', 586);
                                        var estagio3 = this.add.sprite(330, 335, 'geral', 586);
                                        var estagio3 = this.add.sprite(370, 335, 'geral', 586);
                                        var estagio3 = this.add.sprite(410, 335, 'geral', 586);
                                        var estagio3 = this.add.sprite(450, 335, 'geral', 586);
                                    

                                        console.log("estagio 3")
                                        this.thirdStageActivated = true
                                 }, 60000)

                            } else if(!this.fourthStageActivated) {
                                    setTimeout(() => {
                            

                                    var estagio4 = this.add.sprite(250, 335, 'geral', 587);
                                    estagio4 = this.add.sprite(290, 335, 'geral', 587);
                                    estagio4 = this.add.sprite(330, 335, 'geral', 587);
                                    estagio4 = this.add.sprite(370, 335, 'geral', 587);
                                    estagio4 = this.add.sprite(410, 335, 'geral', 587);
                                    estagio4  = this.add.sprite(450, 335, 'geral', 587);

                                    console.log("estagio 4")
                                 
                            }, 60000)
                        }
                             
                    }
                }
            
                if (object.name == "Repolho") {
           
            
                    this.player.setFrame(133, 146)

            

                        if ( space.isDown) {
                            

                            if (!this.secondStageActivated) {
                                setTimeout(() => {
                                    var estagio2 = this.add.sprite(250, 365, 'geral', 609);
                                    var estagio2 = this.add.sprite(290, 365, 'geral', 609);
                                    var estagio2 = this.add.sprite(330, 365, 'geral', 609);
                                    var estagio2 = this.add.sprite(370, 365, 'geral', 609);
                                    var estagio2 = this.add.sprite(410, 365, 'geral', 609);
                                    var estagio2 = this.add.sprite(450, 365, 'geral', 609);
                                    

                                        console.log("estagio 2");
                                        this.secondStageActivated = true
                                }, 60000)
                            } else if(!this.thirdStageActivated) {
                                    setTimeout(() => {       
                                      

                                    var estagio3 = this.add.sprite(250, 365, 'geral', 610);
                                    var estagio3 = this.add.sprite(290, 365, 'geral', 610);
                                    var estagio3 = this.add.sprite(330, 365, 'geral', 610);
                                    var estagio3 = this.add.sprite(370, 365, 'geral', 610);
                                    var estagio3 = this.add.sprite(410, 365, 'geral', 610);
                                    var estagio3 = this.add.sprite(450, 365, 'geral', 610);

                                        console.log("estagio 3")
                                        this.thirdStageActivated = true
                                 }, 60000)

                            } else if(!this.fourthStageActivated) {
                                    setTimeout(() => {
                            

                                        var estagio4 = this.add.sprite(250, 365, 'geral', 611);
                                        var estagio4 = this.add.sprite(290, 365, 'geral', 611);
                                        var estagio4 = this.add.sprite(330, 365, 'geral', 611);
                                        var estagio4 = this.add.sprite(370, 365, 'geral', 611);
                                        var estagio4 = this.add.sprite(410, 365, 'geral', 611);
                                        var estagio4 = this.add.sprite(450, 365, 'geral', 611);

                                    console.log("estagio 4")
                                 
                            }, 60000)
                        }
                             
                    }
                }

                if (object.name == "Rabanete") {
           
            
                    this.player.setFrame(133, 146)
                    var estagio2;
                    var estagio3;
            

                        if ( space.isDown) {
                            

                            if (!this.secondStageActivated) {
                                setTimeout(() => {
                                    estagio2 = this.add.sprite(250, 394, 'geral', 825);
                                    estagio2 = this.add.sprite(290, 394, 'geral', 825);
                                    estagio2= this.add.sprite(330, 394, 'geral', 825);
                                    estagio2 = this.add.sprite(370, 394, 'geral', 825);
                                    estagio2 = this.add.sprite(410, 394, 'geral', 825);
                                    estagio2= this.add.sprite(450, 394, 'geral', 825);
                                    

                                    console.log("estagio 2");
                                    this.secondStageActivated = true
                    
                                }, 60000)
                            } else if(!this.thirdStageActivated) {
                                    setTimeout(() => {    
    

                                    estagio3 = this.add.sprite(250, 394, 'geral', 826);
                                    estagio3 = this.add.sprite(290, 394, 'geral', 826);
                                    estagio3= this.add.sprite(330, 394, 'geral', 826);
                                    estagio3 = this.add.sprite(370, 394, 'geral', 826);
                                    estagio3 = this.add.sprite(410, 394, 'geral', 826);
                                    estagio3= this.add.sprite(450, 394, 'geral', 826);

                                        console.log("estagio 3")
                                        this.thirdStageActivated = true
                                 }, 60000)

                            } else if(!this.fourthStageActivated) {
                                    setTimeout(() => {

                                    
                                    var estagio4 = this.add.sprite(250, 394, 'geral', 827);
                                    var estagio4 = this.add.sprite(290, 394, 'geral', 827);
                                    var estagio4= this.add.sprite(330, 394, 'geral', 827);
                                    var estagio4 = this.add.sprite(370, 394, 'geral', 827);
                                    var estagio4 = this.add.sprite(410, 394, 'geral', 827);
                                    var estagio4= this.add.sprite(450, 394, 'geral', 827);

                                    console.log("estagio 4")
                                 
                            }, 60000)
                        }
                             
                    }
                }
                    
            
            
                      
        }


        if(this.player.isAction) {
            this.isTouching = true;
            if(object.name == "sementeMaca"){

                if (this.player.body.enable == true && !object.isTouched ) {
                    
                    var sementeMaca = this.add.sprite(385, 58, 'geral', 633);

                    console.log("adicionando semente");
                    object.isTouched = true;

                    setTimeout(() => {
                        var estagio2 = this.add.sprite(385, 44, 'geral', 588);
                        var estagio2 = this.add.sprite(385, 60, 'geral', 612);
                    }, 180000)
                    
                    setTimeout(() => {
                        var estagio3 = this.add.sprite(377, 44, 'geral', 589);
                        var estagio3 = this.add.sprite(393, 44, 'geral', 590);
                        var estagio3 = this.add.sprite(377, 60, 'geral', 613);
                        var estagio3 = this.add.sprite(393, 60, 'geral', 614);
                    }, 360000)

                    setTimeout(() => {
                        var estagio4_1 = this.add.sprite(377, 44, 'geral', 591);
                        var estagio4_2 = this.add.sprite(393, 44, 'geral', 592);
                        var estagio4_3 = this.add.sprite(377, 60, 'geral', 615);
                        var estagio4_4 = this.add.sprite(393, 60, 'geral', 616);
                    }, 540000)
                    
              }  
              
            } 
        
            if(space.isDown) {
            
                if (object.name == "arvoreMaca") {
                    if (this.player.body.enable == true && !this.arvoreNaoColhida) {
                        this.player.setFrame(130, 137)
                        var estagio3 = this.add.sprite(377, 44, 'geral', 589);
                        var estagio3 = this.add.sprite(393, 44, 'geral', 590);
                        var estagio3 = this.add.sprite(377, 60, 'geral', 613);
                        var estagio3 = this.add.sprite(393, 60, 'geral', 614);
                        // Reproduzir os frames da animação da árvore de maçã (frames 36 a 49)
                        this.arvore.play('arvoreMacaAnim')
                        this.arvoreNaoColhida = true;
                        

                    } else if(this.arvoreNaoColhida)  {
                
                        this.arvore.play('arvoreMacaAnim')
                        this.arvore.stop('arvoreMacaAnim');
                        this.events.emit('appleCollected', this.player.appleCount); // Emitindo evento para atualizar o HUD

                        setTimeout(() => {
                            var estagio4_1 = this.add.sprite(377, 44, 'geral', 591);
                            var estagio4_2 = this.add.sprite(393, 44, 'geral', 592);
                            var estagio4_3 = this.add.sprite(377, 60, 'geral', 615);
                            var estagio4_4 = this.add.sprite(393, 60, 'geral', 616);
                        }, 3000)
      
                    }
                } 
            }

    }


    }

    createHUD() {
        // Criando as sprites da caixa de HUD
        const appleIcon = this.add.sprite(420, 40, 'geral', 674);
        const appleCount = this.add.text(430, 40, '0', { fontFamily: 'Arial', fontSize: 10, color: '#FFFFFF' });

        // Atualizando a contagem de maçãs no HUD quando o jogador coletar uma
        this.events.on('appleCollected', (count) => {
            appleCount.setText(3);
        });
    }

    createAnimArvore() {
        this.arvore = this.physics.add.sprite(361, 72, 'arvoreMaca').setOrigin(0,1).setDepth(this.layers.length + 1).setFrame(1);
        this.arvore.anims.create({
            key: 'arvoreMacaAnim',
            frames: this.anims.generateFrameNumbers('arvoreMaca', { start: 36, end: 49 }),
            frameRate: 20,
            repeat: 0
        });

    }
}
            
        
