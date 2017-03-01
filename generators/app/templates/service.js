import Rice from 'ricejs'

export function <%= name  %>(option, test){
    
    this.start = () => {
        
    }
    
    this.stop = (next) => {
        next(null)
    }
    
    this.restart = (next) => {
        next(null)
    }
    
    this.reload = (next) => {
        next(null)
    }
    
    return this;
    
}