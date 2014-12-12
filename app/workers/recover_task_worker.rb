# encoding: utf-8

class RecoverTaskWorker
  include Sidekiq::Worker

  # only try 2x to recover, which should be enough.
  sidekiq_options :retry => 2

  def perform(task_id)
    ActiveRecord::Base.connection_pool.with_connection do
      task = Task.find_by_id(task_id)
      begin
        task.recover! if task
      rescue StateMachine::InvalidTransition => err
        logger.warn "RecoverTaskWorker: StateMachine::InvalidTransition: task: #{task_id}, err: #{err.message}"
      end
      true
    end
  end

end
