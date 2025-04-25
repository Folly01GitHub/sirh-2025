
          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={isLoading || allItemsLoading || isSubmitting}
          >
            {isSubmitting ? "Soumission en cours..." : "Soumettre mon auto-évaluation"}
          </Button>
