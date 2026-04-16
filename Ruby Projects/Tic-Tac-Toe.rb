class TicTacToe
  WIN_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], # Horizontal rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], # Vertical columns
    [0, 4, 8], [2, 4, 6]             # Diagonals
  ]

  def initialize
    @board = Array.new(9, " ")
    @current_player = "X"
  end

  def display_board
    puts "\n"
    puts " #{@board[0]} | #{@board[1]} | #{@board[2]} "
    puts "---|---|---"
    puts " #{@board[3]} | #{@board[4]} | #{@board[5]} "
    puts "---|---|---"
    puts " #{@board[6]} | #{@board[7]} | #{@board[8]} "
    puts "\n"
  end

  def play
    puts "Welcome to Ruby Tic-Tac-Toe!"
    display_board

    until game_over?
      puts "Player #{@current_player}, please choose a position (1-9):"
      input = gets.chomp.to_i - 1

      if valid_move?(input)
        @board[input] = @current_player
        display_board
        
        if won?
          puts "Congratulations! Player #{@current_player} has won!"
          return
        elsif draw?
          puts "It's a draw!"
          return
        end
        
        switch_player
      else
        puts "Invalid move! Please select a valid, empty position between 1 and 9."
      end
    end
  end

  private

  def valid_move?(index)
    index.between?(0, 8) && @board[index] == " "
  end

  def switch_player
    @current_player = @current_player == "X" ? "O" : "X"
  end

  def won?
    WIN_COMBINATIONS.any? do |combo|
      @board[combo[0]] == @current_player &&
      @board[combo[1]] == @current_player &&
      @board[combo[2]] == @current_player
    end
  end

  def draw?
    @board.none? { |spot| spot == " " }
  end

  def game_over?
    won? || draw?
  end
end

# Start the game
game = TicTacToe.new
game.play
